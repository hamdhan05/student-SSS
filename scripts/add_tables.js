const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { error: err1 } = await supabase.rpc('execute_sql', {
        sql_query: `
        CREATE TABLE IF NOT EXISTS student_academic_history (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id uuid REFERENCES students(id) ON DELETE CASCADE,
          from_class_id text,
          to_class_id text,
          academic_year text,
          promoted_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS system_logs (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          action text NOT NULL,
          description text NOT NULL,
          actor text DEFAULT 'System',
          created_at timestamp DEFAULT now()
        );
        `
    });
    console.log("Error 1:", err1);
}
run();
