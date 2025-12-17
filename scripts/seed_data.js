
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for simplicity in script, matching check_supabase.js
const supabaseUrl = 'https://ehvbvzszsexbhzhujacj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmJ2enN6c2V4Ymh6aHVqYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODMwMTksImV4cCI6MjA4MTU1OTAxOX0.7VS_9yc0rcbbS8kJlDFBRUA5MtvgemihymTio-KwFTM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('Seeding data...');

    // 1. Clear existing data (optional, but good for demo consistency)
    // Order matters due to foreign keys
    await supabase.from('attendance_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('academic_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('fee_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('homeworks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('holidays').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Holidays
    await supabase.from('holidays').insert([
        { date: '2025-12-25', name: 'Christmas Day', type: 'Public Holiday' },
        { date: '2026-01-01', name: 'New Year Day', type: 'Public Holiday' }
    ]);
    console.log('Holidays seeded.');

    // 3. Insert Notices
    await supabase.from('notices').insert([
        { title: 'Welcome Back', content: 'Welcome to the new academic session.', date: '2025-12-15', created_by: 'Headmaster' },
        { title: 'Exam Schedule', content: 'Mid-term exams start next week.', date: '2025-12-18', created_by: 'Headmaster' }
    ]);
    console.log('Notices seeded.');

    // 4. Insert Teachers
    const { data: teachers, error: teacherError } = await supabase.from('teachers').insert([
        {
            name: 'John Smith', email: 'john.smith@school.com', domain: 'Mathematics',
            qualification: 'M.Sc', experience: '10 years', phone: '1234567890',
            assigned_classes: ['10A']
        },
        {
            name: 'Sarah Johnson', email: 'sarah.j@school.com', domain: 'English',
            qualification: 'M.A.', experience: '8 years', phone: '0987654321',
            assigned_classes: ['10A']
        }
    ]).select();

    if (teacherError) console.error('Teacher Error:', teacherError);
    console.log('Teachers seeded.');

    // 5. Insert Students (Class 10, Section A)
    const studentsToInsert = [
        {
            name: 'Alice Johnson', roll_number: '101', class_grade: '10', section: 'A',
            email: 'alice.j@student.school.com', phone: '5550101', parent_name: 'Mr. Johnson'
        },
        {
            name: 'Bob Williams', roll_number: '102', class_grade: '10', section: 'A',
            email: 'bob.w@student.school.com', phone: '5550102', parent_name: 'Mr. Williams'
        },
        {
            name: 'Charlie Brown', roll_number: '103', class_grade: '10', section: 'A',
            email: 'charlie.b@student.school.com', phone: '5550103', parent_name: 'Mr. Brown'
        }
    ];

    const { data: students, error: studentError } = await supabase.from('students').insert(studentsToInsert).select();
    if (studentError) console.error('Student Error:', studentError);

    // 6. Insert Related Data for Students
    for (const student of students) {
        // Fees
        await supabase.from('fee_records').insert({
            student_id: student.id,
            total_fee: 50000,
            paid_amount: 25000,
            terms: [{ name: 'Term 1', amount: 25000, status: 'paid' }, { name: 'Term 2', amount: 25000, status: 'pending' }]
        });

        // Attendance (Last 5 days)
        const attendance = [
            { student_id: student.id, date: '2025-12-16', status: 'present' },
            { student_id: student.id, date: '2025-12-15', status: 'present' },
            { student_id: student.id, date: '2025-12-14', status: 'absent' },
            { student_id: student.id, date: '2025-12-13', status: 'present' },
            { student_id: student.id, date: '2025-12-12', status: 'present' }
        ];
        await supabase.from('attendance_records').insert(attendance);

        // Academic Records
        const academics = [
            { student_id: student.id, subject: 'Mathematics', marks: 85, total_marks: 100, grade: 'A', term: 'Mid-term' },
            { student_id: student.id, subject: 'English', marks: 78, total_marks: 100, grade: 'B+', term: 'Mid-term' },
            { student_id: student.id, subject: 'Science', marks: 92, total_marks: 100, grade: 'A+', term: 'Mid-term' }
        ];
        await supabase.from('academic_records').insert(academics);

        // Complaints
        if (student.name === 'Alice Johnson') {
            await supabase.from('complaints').insert({
                student_id: student.id, category: 'Facilities', text: 'AC not working in class 10A.', status: 'pending', date: '2025-12-16', title: 'Facilities', description: 'AC not working in class 10A.'
            });
        }
    }
    console.log('Student related data seeded.');

    // 7. Insert Homework for Class 10A
    await supabase.from('homeworks').insert([
        { class_grade: '10', section: 'A', subject: 'Mathematics', title: 'Algebra', description: 'Solve Ex 5.1', due_date: '2025-12-20', created_by: 'Headmaster' },
        { class_grade: '10', section: 'A', subject: 'English', title: 'Essay', description: 'Write about Winter Vacation', due_date: '2025-12-22', created_by: 'Headmaster' }
    ]);
    console.log('Homework seeded.');

    console.log('Seeding completed successfully!');
}

seedData();
