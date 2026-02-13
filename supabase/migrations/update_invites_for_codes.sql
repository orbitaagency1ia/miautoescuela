-- Add columns to invites table for better code management
ALTER TABLE invites
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'used'));

ALTER TABLE invites
ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;

ALTER TABLE invites
ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1;

ALTER TABLE invites
ADD COLUMN IF NOT EXISTS code_type VARCHAR(20) DEFAULT 'single' CHECK (code_type IN ('single', 'multi', 'public'));

-- Add comments
COMMENT ON COLUMN invites.status IS 'Status of the invite code: active, revoked, expired, or used';
COMMENT ON COLUMN invites.used_count IS 'Number of times this code has been used';
COMMENT ON COLUMN invites.max_uses IS 'Maximum number of times this code can be used';
COMMENT ON COLUMN invites.code_type IS 'Type of code: single (one student), multi (multiple students), public (join code)';

-- Create index for faster queries on active codes
CREATE INDEX IF NOT EXISTS idx_invites_status_expires ON invites(school_id, status, expires_at);
