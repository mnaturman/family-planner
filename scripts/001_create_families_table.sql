-- Create families table to group family members
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_families_name ON families(name);
