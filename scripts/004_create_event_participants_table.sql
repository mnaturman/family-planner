-- Create event_participants table for tracking who's invited/attending
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'invited', -- invited, accepted, declined, maybe
  is_organizer BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, family_member_id)
);

-- Create indexes for participant queries
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member_id ON event_participants(family_member_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);
