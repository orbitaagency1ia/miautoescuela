-- Add missing columns to schools table

-- Secondary color for branding gradients
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#1E40AF';

-- Banner URL for hero image
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Welcome message for students
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Website URL
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Physical address
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comments
COMMENT ON COLUMN schools.secondary_color IS 'Secondary color for gradients and accents';
COMMENT ON COLUMN schools.banner_url IS 'URL of the banner/hero image for the school';
COMMENT ON COLUMN schools.welcome_message IS 'Custom welcome message shown to students';
COMMENT ON COLUMN schools.website IS 'School website URL';
COMMENT ON COLUMN schools.address IS 'Physical address of the school';
