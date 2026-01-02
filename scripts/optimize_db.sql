-- Run this script in your Supabase SQL Editor

-- 1. Students Table Indexes
CREATE INDEX IF NOT EXISTS idx_students_class_section ON students(class_grade, section);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- 2. Attendance Records Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);

-- 3. Academic Records Indexes
CREATE INDEX IF NOT EXISTS idx_academic_student_subject ON academic_records(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_academic_term ON academic_records(term);

-- 4. Fee Records Indexes
CREATE INDEX IF NOT EXISTS idx_fees_student ON fee_records(student_id);

-- 5. Teachers Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- 6. Unique Constraints for Batch Upsert (Crucial for performance)
ALTER TABLE attendance_records ADD CONSTRAINT attendance_student_date_unique UNIQUE (student_id, date);
ALTER TABLE academic_records ADD CONSTRAINT academic_student_subject_term_unique UNIQUE (student_id, subject, term);

-- 7. Foreign Key Constraints (Ensure they exist for join performance)
-- Usually Supabase handles this, but explicit indexes on FKs help.
