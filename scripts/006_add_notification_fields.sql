-- Add phone numbers and notification preferences to family_members table
ALTER TABLE family_members 
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN notification_preferences JSONB DEFAULT '{"event_reminders": true, "event_invites": true, "schedule_changes": true}'::jsonb;

-- Create notifications table to track sent notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'reminder', 'invite', 'update'
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_notifications_family_member ON notifications(family_member_id);
CREATE INDEX idx_notifications_event ON notifications(event_id);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );
