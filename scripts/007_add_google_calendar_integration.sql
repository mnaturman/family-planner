-- Add Google Calendar integration fields to family_members table
ALTER TABLE family_members 
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN google_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN google_calendar_sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN google_calendar_last_sync TIMESTAMP WITH TIME ZONE;

-- Add Google Calendar ID to events table for tracking synced events
ALTER TABLE events 
ADD COLUMN google_calendar_id VARCHAR(255),
ADD COLUMN sync_to_google BOOLEAN DEFAULT false;

-- Create calendar_sync_logs table to track sync operations
CREATE TABLE calendar_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'import', 'export', 'bidirectional'
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
    events_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_events_google_calendar_id ON events(google_calendar_id);
CREATE INDEX idx_calendar_sync_logs_family_member ON calendar_sync_logs(family_member_id);
CREATE INDEX idx_calendar_sync_logs_created_at ON calendar_sync_logs(created_at);

-- Enable RLS
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_sync_logs
CREATE POLICY "Users can view their own sync logs" ON calendar_sync_logs
    FOR SELECT USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own sync logs" ON calendar_sync_logs
    FOR INSERT WITH CHECK (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );
