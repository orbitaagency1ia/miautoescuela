-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  completion_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_school ON certificates(school_id);
CREATE INDEX IF NOT EXISTS idx_certificates_module ON certificates(module_id);

-- Add comments
COMMENT ON TABLE certificates IS 'Certificates issued to students upon completing modules';
COMMENT ON COLUMN certificates.certificate_number IS 'Unique certificate identifier for verification';
COMMENT ON COLUMN certificates.pdf_url IS 'URL to the generated PDF certificate';

-- Function to generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  cert_num TEXT;
BEGIN
  LOOP
    cert_num := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || upper(substring(encode(gen_random_bytes(4), 'base64'), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE certificate_number = cert_num);
  END LOOP;
  RETURN cert_num;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award certificate on module completion
CREATE OR REPLACE FUNCTION check_module_completion()
RETURNS TRIGGER AS $$
DECLARE
  module_lessons INT;
  completed_lessons INT;
BEGIN
  -- Only proceed if a lesson was just completed
  IF NEW.completed_at IS NULL OR OLD.completed_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get lesson's module
  SELECT m.id INTO module_lessons
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  WHERE l.id = NEW.lesson_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Count total and completed lessons in this module for this user
  SELECT COUNT(*) INTO module_lessons
  FROM lessons
  WHERE module_id = (SELECT module_id FROM lessons WHERE id = NEW.lesson_id);

  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  WHERE lp.user_id = NEW.user_id
    AND l.module_id = (SELECT module_id FROM lessons WHERE id = NEW.lesson_id)
    AND lp.completed_at IS NOT NULL;

  -- If all lessons in module are completed, issue certificate
  IF completed_lessons >= module_lessons THEN
    INSERT INTO certificates (
      user_id,
      school_id,
      module_id,
      certificate_number,
      student_name,
      course_name,
      completion_date
    )
    SELECT
      NEW.user_id,
      NEW.school_id,
      (SELECT module_id FROM lessons WHERE id = NEW.lesson_id),
      generate_certificate_number(),
      (SELECT full_name FROM profiles WHERE user_id = NEW.user_id),
      (SELECT title FROM modules WHERE id = (SELECT module_id FROM lessons WHERE id = NEW.lesson_id)),
      CURRENT_DATE
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-issuing certificates
DROP TRIGGER IF EXISTS auto_issue_certificate ON lesson_progress;
CREATE TRIGGER auto_issue_certificate
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_module_completion();
