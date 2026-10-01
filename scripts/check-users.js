import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehvbvzszsexbhzhujacj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmJ2enN6c2V4Ymh6aHVqYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODMwMTksImV4cCI6MjA4MTU1OTAxOX0.7VS_9yc0rcbbS8kJlDFBRUA5MtvgemihymTio-KwFTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: students, error: studentError } = await supabase.from('students').select('email').limit(5);
  console.log('Students error:', studentError);
  console.log('Students data:', students);
  
  const { data: teachers, error: teacherError } = await supabase.from('teachers').select('email').limit(5);
  console.log('Teachers error:', teacherError);
  console.log('Teachers data:', teachers);
}

check();
