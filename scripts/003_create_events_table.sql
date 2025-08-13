-- Create events table for calendar entries
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50) DEFAULT 'general', -- appointment, meeting, birthday, holiday, etc.
  is_all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- for recurring events (RRULE format)
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for calendar queries
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
