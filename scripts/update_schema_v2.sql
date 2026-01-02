-- Run this script in Supabase SQL Editor

-- 1. Add new columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS admission_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS emis_number TEXT UNIQUE;

-- 2. Add indexes for the new columns (User requested everything to be fast)
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_emis_number ON students(emis_number);

-- 3. (Optional) Backfill existing rows if needed
-- UPDATE students SET admission_number = 'IMS-' || id WHERE admission_number IS NULL;
