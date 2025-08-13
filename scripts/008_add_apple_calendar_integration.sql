-- Add Apple Calendar (iCloud) integration fields to family_members
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS apple_calendar_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS apple_calendar_password TEXT, -- App-specific password
ADD COLUMN IF NOT EXISTS apple_calendar_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS apple_calendar_url VARCHAR(500);

-- Add Apple Calendar sync to existing sync logs table
ALTER TABLE calendar_sync_logs 
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'google' CHECK (platform IN ('google', 'apple'));

-- Update existing records to have platform = 'google'
UPDATE calendar_sync_logs SET platform = 'google' WHERE platform IS NULL;
