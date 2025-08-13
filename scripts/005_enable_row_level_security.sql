-- Enable Row Level Security (RLS) on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for families table
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can update their family" ON families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for family_members table
CREATE POLICY "Users can view family members in their families" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own family member profile" ON family_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Family admins can manage family members" ON family_members
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for events table
CREATE POLICY "Users can view events in their families" ON events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can create events" ON events
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and family admins can update events" ON events
  FOR UPDATE USING (
    created_by IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
    ) OR
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for event_participants table
CREATE POLICY "Users can view participants for events in their families" ON event_participants
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN family_members fm ON e.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation status" ON event_participants
  FOR UPDATE USING (
    family_member_id IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
    )
  );
