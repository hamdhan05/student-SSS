
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ehvbvzszsexbhzhujacj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmJ2enN6c2V4Ymh6aHVqYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODMwMTksImV4cCI6MjA4MTU1OTAxOX0.7VS_9yc0rcbbS8kJlDFBRUA5MtvgemihymTio-KwFTM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') {
                console.log('Connection Successful! (Table "students" not found. PLEASE RUN THE SQL SCRIPT)');
            } else {
                console.log('Connection Attempted. Result:', error.message, 'Code:', error.code);
                if (error.message && error.message.includes('fetch failed')) {
                    console.error('Network Error: Could not connect to Supabase.');
                }
            }
        } else {
            console.log('Connection Successful! (Table "students" exists)');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verifyConnection();
