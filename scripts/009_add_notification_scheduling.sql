-- Create scheduled_notifications table for queuing future notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('reminder', 'invitation', 'schedule_change')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  message_template VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_family_member_id ON scheduled_notifications(family_member_id);

-- Enable RLS
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy for scheduled notifications
CREATE POLICY "Users can view their scheduled notifications" ON scheduled_notifications
  FOR SELECT USING (
    family_member_id IN (
      SELECT id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add reminder preferences to family_members if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_members' 
    AND column_name = 'reminder_minutes_before'
  ) THEN
    ALTER TABLE family_members 
    ADD COLUMN reminder_minutes_before INTEGER[] DEFAULT ARRAY[15, 60, 1440]; -- 15 min, 1 hour, 1 day
  END IF;
END $$;
