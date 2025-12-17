
// Mock env vars before import (since we don't have dotenv configured for this script execution context if not using next dev)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ehvbvzszsexbhzhujacj.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmJ2enN6c2V4Ymh6aHVqYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODMwMTksImV4cCI6MjA4MTU1OTAxOX0.7VS_9yc0rcbbS8kJlDFBRUA5MtvgemihymTio-KwFTM';

import { getStudentById, getNotices, getHomework, getStudents } from '../lib/api';

async function verify() {
    console.log('--- Verifying Student Portal Data ---');

    // 1. Find a student
    const students = await getStudents({ q: 'Alice' });
    if (students.data.length === 0) {
        console.error('No student found named Alice');
        return;
    }
    const alice = students.data[0];
    console.log(`Found Student: ${alice.name} (${alice.id})`);

    // 2. Get Full Profile (Portal View)
    try {
        const profile = await getStudentById(alice.id);

        console.log('\n--- Student Profile ---');
        console.log(`Name: ${profile.name}`);
        console.log(`Class: ${profile.class}-${profile.section}`);

        console.log('\n--- Fees ---');
        console.log('Total:', profile.fees?.totalFee);
        console.log('Paid:', profile.fees?.paidAmount);
        console.log('Due:', profile.fees?.dueAmount);

        console.log('\n--- Attendance ---');
        console.log(`Total Records: ${profile.attendance?.length}`);
        console.log(`Percentage: ${profile.attendancePercentage}%`);

        console.log('\n--- Academics ---');
        profile.academics?.forEach(sub => {
            console.log(`${sub.subject}: ${sub.marks}/${sub.totalMarks} (${sub.grade})`);
        });

    } catch (e) {
        console.error('Error fetching student profile:', e);
    }

    // 3. Get Notices
    try {
        const notices = await getNotices();
        console.log(`\n--- Notices (${notices.length}) ---`);
        notices.slice(0, 2).forEach(n => console.log(`- ${n.title} (${n.date})`));
    } catch (e) {
        console.error('Error fetching notices:', e);
    }

    // 4. Get Homework
    try {
        const homework = await getHomework({ classId: '10', section: 'A' });
        console.log(`\n--- Homework (${homework.length}) ---`);
        homework.forEach(h => console.log(`- ${h.subject}: ${h.title}`));
    } catch (e) {
        console.error('Error fetching homework:', e);
    }
}

verify();
