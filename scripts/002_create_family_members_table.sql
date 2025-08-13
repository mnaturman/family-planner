-- Create family_members table to extend user profiles
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- admin, member, child
  color VARCHAR(7) DEFAULT '#3B82F6', -- hex color for calendar display
  phone VARCHAR(20),
  birthday DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, family_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);
