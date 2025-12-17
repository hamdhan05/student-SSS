
const { createClient } = require('@supabase/supabase-js');

console.log('Checking Supabase dependency...');
try {
    const supabase = createClient('https://xyz.supabase.co', 'public-key');
    console.log('SUCCESS: @supabase/supabase-js is installed and working.');
} catch (error) {
    console.error('ERROR: Could not initialize Supabase client:', error.message);
    process.exit(1);
}

console.log('Verification complete.');
