import { supabase } from './supabaseClient';
import {
  Student,
  Teacher,
  Notice,
  Holiday,
  FeeRecord,
  Complaint,
  AttendanceRecord,
  AcademicRecord,
  Homework,
  Notification
} from './mockData';

// Constants
// Classes and Sections - In a real app these might also be in DB
export const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const sections = ['A', 'B', 'C'];

// Simulated API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Classes and Sections
export const getClasses = async () => {
  const { data, error } = await supabase.from('classes').select('*');
  if (error) throw error;
  
  return data.sort((a, b) => {
      // Sort Pre-KG, LKG, UKG first, then numbers
      const order: Record<string, number> = { 'Pre-KG': 1, 'LKG': 2, 'UKG': 3 };
      const aOrder = order[a.name];
      const bOrder = order[b.name];
      
      if (aOrder && bOrder) return aOrder - bOrder;
      if (aOrder) return -1;
      if (bOrder) return 1;
      
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
};

export const getSections = async (classId?: string) => {
  await delay();
  return sections;
};

// Students
export const getStudents = async (params?: {
  classId?: string | number;
  section?: string;
  page?: number;
  limit?: number;
  q?: string;
}) => {
  let query = supabase.from('students').select(`
    id, name, rollNumber:roll_number, class_id, classes(name), section, photo,
    dateOfBirth:dob, gender, email, phone, address,
    parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
    admissionDate:admission_date, admissionNumber:admission_number, emisNumber:emis_number
  `, { count: 'exact' });

  if (params?.classId) {
    query = query.eq('class_id', params.classId.toString());
  }

  if (params?.section) {
    query = query.eq('section', params.section);
  }

  if (params?.q) {
    const q = params.q;
    query = query.or(`name.ilike.%${q}%,roll_number.ilike.%${q}%,email.ilike.%${q}%,emis_number.ilike.%${q}%,admission_number.ilike.%${q}%`);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  query = query.range(start, end);

  const { data, count, error } = await query;

  if (error) throw error;

  const mappedData = data.map((d: any) => ({
    ...d,
    class: d.classes?.name,
    classes: undefined
  }));

  return {
    data: mappedData as unknown as Student[], // Type assertion due to aliasing
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const getStudentStats = async () => {
  const [{ count: total }, { count: boys }, { count: girls }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('gender', 'Male'),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('gender', 'Female')
  ]);

  // For New Admissions, let's say admitted this month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const { count: newAdmissions } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .gte('admission_date', firstDay);

  return {
    total: total || 0,
    boys: boys || 0,
    girls: girls || 0,
    newAdmissions: newAdmissions || 0,
    active: total || 0 // Assuming all are active for now since no status column exists
  };
};

export const createStudent = async (student: Omit<Student, 'id' | 'admissionDate'>) => {
  // Map camelCase to snake_case
  const dbStudent = {
    name: student.name,
    roll_number: student.rollNumber,
    class_id: student.classId || student.class,
    section: student.section,
    photo: student.photo,
    dob: student.dateOfBirth,
    gender: student.gender,
    email: student.email,
    phone: student.phone,
    address: student.address,
    parent_name: student.parentName,
    parent_phone: student.parentPhone,
    parent_email: student.parentEmail,
    admission_number: student.admissionNumber,
    emis_number: student.emisNumber,
    academic_year: student.academicYear,
    // admission_date: default provided by DB or handled here? DB has default current_date.
  };

  const { data, error } = await supabase.from('students').insert(dbStudent).select(`
     id, name, rollNumber:roll_number, classId:class_id, section, photo,
    dateOfBirth:dob, gender, email, phone, address,
    parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
    admissionDate:admission_date
  `).single();

  if (error) throw error;
  return data as unknown as Student;
};

export const getStudentById = async (id: string) => {
  // Fetch student and all related data in ONE query using Supabase joins
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      id, name, rollNumber:roll_number, class:class_id, section, photo,
      dateOfBirth:dob, gender, email, phone, address,
      parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
      admissionDate:admission_date,
      guardianName:guardian_name, guardianPhone:guardian_phone,
      admissionNumber:admission_number, emisNumber:emis_number,
      academicYear:academic_year,
      student_fee_records (*),
      student_sports (*, sport:sports(name, fee)),
      attendance_records (id, date, status),
      academic_records (subject, marks, total_marks, grade, term)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Process Fees
  // Note: One-to-one relation usually, but returns array if not specified singly in join config strictly.
  // Assuming strict foreign key might make it object, but let's handle array possibility safely or object.
  // Based on strict schema, it might be an object or array. Standard Supabase select on reversed FK is usually array unless 1:1.
  // We'll treat it as potentially array[0] or object.
  const feesData = Array.isArray((student as any).student_fee_records) ? (student as any).student_fee_records[0] : (student as any).student_fee_records;

  let fees = null;
  if (feesData) {
    fees = {
      id: feesData.id,
      studentId: feesData.student_id,
      totalFee: feesData.total_fee,
      paidAmount: feesData.paid_amount,
      dueAmount: feesData.due_amount,
      lastPaymentDate: feesData.last_payment_date,
      lastPaymentAmount: feesData.last_payment_amount,
      terms: feesData.terms
    };
  } else {
    fees = {
      totalFee: 50000,
      paidAmount: 0,
      dueAmount: 50000,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
    };
  }

  // Process Attendance
  const attendance = (student.attendance_records || []).map((a: any) => ({
    id: a.id,
    studentId: id, // We know the ID
    date: a.date,
    status: a.status
  }));

  // Calculate attendance percentage
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a: any) => a.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Process Academics
  const academics = (student.academic_records || []).map((a: any) => ({
    studentId: id,
    subject: a.subject,
    marks: a.marks,
    totalMarks: a.total_marks,
    grade: a.grade,
    term: a.term
  }));

  return {
    ...student,
    // Remove the raw joined data from the spread result to keep object clean
    fee_records: undefined,
    attendance_records: undefined,
    academic_records: undefined,

    guardianName: student.parentName || student.guardianName,
    guardianPhone: student.parentPhone || student.guardianPhone,
    academics,
    fees,
    attendance,
    attendancePercentage,
  };
};

// Teachers
export const getTeachers = async () => {
  const { data, error } = await supabase.from('teachers').select(`
    id, name, photo, domain, email, phone,
    dateOfBirth:dob, joiningDate:joining_date, qualification, experience,
    address, fatherName:father_name, motherName:mother_name, assigned_classes
  `);

  if (error) throw error;

  // Transform assigned_classes to classes
  return data.map((t: any) => ({
    ...t,
    subject: t.domain, // domain maps to subject
    classes: t.assigned_classes || []
  })) as Teacher[];
};

export const createTeacher = async (teacher: Omit<Teacher, 'id' | 'joiningDate'>) => {
  const dbTeacher = {
    name: teacher.name,
    photo: teacher.photo,
    domain: teacher.domain,
    email: teacher.email,
    phone: teacher.phone,
    dob: teacher.dateOfBirth,
    qualification: teacher.qualification,
    experience: teacher.experience,
    address: teacher.address,
    father_name: teacher.fatherName,
    mother_name: teacher.motherName,
    assigned_classes: teacher.classes
  };

  const { data, error } = await supabase.from('teachers').insert(dbTeacher).select(`
    id, name, photo, domain, email, phone,
    dateOfBirth:dob, joiningDate:joining_date, qualification, experience,
    address, fatherName:father_name, motherName:mother_name, assigned_classes
  `).single();

  if (error) throw error;

  return {
    ...data,
    subject: data.domain,
    classes: data.assigned_classes || []
  } as Teacher;
};

export const getTeacherById = async (id: string) => {
  const { data, error } = await supabase.from('teachers').select(`
    id, name, photo, domain, email, phone,
    dateOfBirth:dob, joiningDate:joining_date, qualification, experience,
    address, fatherName:father_name, motherName:mother_name, assigned_classes
  `).eq('id', id).single();

  if (error) throw error;

  return {
    ...data,
    subject: data.domain,
    classes: data.assigned_classes || []
  };
};

export const updateStudent = async (student: Student & { classId?: string, academicYear?: string }) => {
  // Check for duplicate EMIS
  const { data: existingEmis } = await supabase
      .from('students')
      .select('id')
      .eq('emis_number', student.emisNumber)
      .neq('id', student.id)
      .maybeSingle();
  if (existingEmis) {
      throw new Error('Student with this EMIS number already exists.');
  }

  // Check for duplicate Admission Number
  const { data: existingAdm } = await supabase
      .from('students')
      .select('id')
      .eq('admission_number', student.admissionNumber)
      .neq('id', student.id)
      .maybeSingle();
  if (existingAdm) {
      throw new Error('Admission number already exists.');
  }

  const dbStudent = {
    name: student.name,
    roll_number: student.rollNumber,
    class_id: student.classId || student.class, // Fallback if classId is passed as class
    section: student.section,
    photo: student.photo,
    dob: student.dateOfBirth,
    gender: student.gender,
    email: student.email,
    phone: student.phone,
    address: student.address,
    parent_name: student.parentName,
    parent_phone: student.parentPhone,
    parent_email: student.parentEmail,
    admission_number: student.admissionNumber,
    emis_number: student.emisNumber,
    academic_year: student.academicYear,
  };

  // Fetch existing to check class change
  const { data: currentStudent } = await supabase.from('students').select('class_id, academic_year').eq('id', student.id).single();

  const { data, error } = await supabase.from('students').update(dbStudent).eq('id', student.id).select(`
     id, name, rollNumber:roll_number, classId:class_id, section, photo,
    dateOfBirth:dob, gender, email, phone, address,
    parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
    admissionDate:admission_date
  `).single();

  if (error) throw error;

  if (currentStudent && currentStudent.class_id !== dbStudent.class_id) {
      // Log History
      try {
          await supabase.from('student_academic_history').insert({
              student_id: student.id,
              from_class_id: currentStudent.class_id,
              to_class_id: dbStudent.class_id,
              academic_year: dbStudent.academic_year || currentStudent.academic_year
          });
      } catch (e) {}

      // Regenerate Fees
      await supabase.from('student_fee_records').delete().eq('student_id', student.id).eq('payment_status', 'pending');
      
      const { data: classFees } = await supabase.from('class_fee_structures').select('*').eq('class_id', dbStudent.class_id);
      if (classFees && classFees.length > 0) {
          const feeRecords = classFees.map((fs: any) => ({
              student_id: student.id,
              fee_type_id: fs.fee_type_id,
              amount: fs.amount,
              paid_amount: 0,
              due_amount: fs.amount,
              academic_year: dbStudent.academic_year || currentStudent.academic_year,
              payment_status: 'pending'
          }));
          await supabase.from('student_fee_records').insert(feeRecords);
      }

      // Initialize Gradebook
      const defaultSubjects = ['Mathematics', 'Science', 'English', 'History', 'Physics'];
      const academicRecordsToInsert = defaultSubjects.map(sub => ({
          student_id: student.id,
          subject: sub,
          marks: null,
          total_marks: 100,
          grade: null,
          term: 'Term 1'
      }));
      try {
          await supabase.from('academic_records').insert(academicRecordsToInsert);
      } catch (e) {}
  }

  // System Log
  try {
      await supabase.from('system_logs').insert({
          action: 'Student Updated',
          description: `Student ${student.name} profile was updated.`,
      });
  } catch (e) {}

  return data as unknown as Student;
};

export const updateTeacher = async (teacher: Teacher) => {
  const dbTeacher = {
    name: teacher.name,
    photo: teacher.photo,
    domain: teacher.domain,
    email: teacher.email,
    phone: teacher.phone,
    dob: teacher.dateOfBirth,
    qualification: teacher.qualification,
    experience: teacher.experience,
    address: teacher.address,
    father_name: teacher.fatherName,
    mother_name: teacher.motherName,
    assigned_classes: teacher.classes
  };

  const { data, error } = await supabase.from('teachers').update(dbTeacher).eq('id', teacher.id).select(`
    id, name, photo, domain, email, phone,
    dateOfBirth:dob, joiningDate:joining_date, qualification, experience,
    address, fatherName:father_name, motherName:mother_name, assigned_classes
  `).single();

  if (error) throw error;

  return {
    ...data,
    subject: data.domain,
    classes: data.assigned_classes || []
  } as Teacher;
};

// Notices
export const getNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, content, date, createdBy:created_by, createdAt:created_at')
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Notice[];
};

export const createNotice = async (notice: Omit<Notice, 'id'>) => {
  const dbNotice = {
    title: notice.title,
    content: notice.content,
    date: notice.date,
    created_by: notice.createdBy,
  };

  const { data, error } = await supabase.from('notices').insert(dbNotice).select('id, title, content, date, createdBy:created_by, createdAt:created_at').single();
  if (error) throw error;
  return data as Notice;
};

export const updateNotice = async (id: string, updates: Partial<Notice>) => {
  const dbUpdates: any = { ...updates };
  if (updates.createdBy) {
    dbUpdates.created_by = updates.createdBy;
    delete dbUpdates.createdBy;
  }

  const { data, error } = await supabase.from('notices').update(dbUpdates).eq('id', id).select('id, title, content, date, createdBy:created_by, createdAt:created_at').single();
  if (error) throw error;
  return data as Notice;
};

export const deleteNotice = async (id: string) => {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// Holidays
export const getHolidays = async (year: number = new Date().getFullYear()) => {
  // Supabase doesn't support easy year extraction in filter without RPC/functions or raw SQL usually
  // But we can filter by range
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data, error } = await supabase.from('holidays')
    .select('*')
    .gte('date', start)
    .lte('date', end);

  if (error) throw error;
  return data as Holiday[];
};

export const getTodayHoliday = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase.from('holidays')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

// Fees
export const getFees = async (studentId: string) => {
  const { data, error } = await supabase.from('fee_records').select(`
    id, studentId:student_id, totalFee:total_fee, paidAmount:paid_amount,
    dueAmount:due_amount, lastPaymentDate:last_payment_date, lastPaymentAmount:last_payment_amount,
    terms
  `).eq('student_id', studentId).maybeSingle();

  if (error) throw error;
  return data as FeeRecord || null;
};

export const updateFeeRecord = async (studentId: string, terms: any[]) => {
  // Recalculate totals
  const totalFee = terms.reduce((acc, t) => acc + t.amount, 0);
  const paidAmount = terms.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  // dueAmount is generated always in SQL, but we might pass it or just let DB handle. 
  // Let's pass total and paid.

  const lastPaymentDate = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.from('fee_records').update({
    terms,
    total_fee: totalFee,
    paid_amount: paidAmount,
    last_payment_date: lastPaymentDate
  }).eq('student_id', studentId).select(`
    id, studentId:student_id, totalFee:total_fee, paidAmount:paid_amount,
    dueAmount:due_amount, lastPaymentDate:last_payment_date, lastPaymentAmount:last_payment_amount,
    terms
  `).single();

  if (error) throw error;
  return data;
};

export const getStudentFees = async (params: { classId?: string; section?: string; q?: string }) => {
  // First get students
  let query = supabase.from('students').select('id, name, roll_number, class_id, section');

  if (params.classId) {
    query = query.eq('class_id', params.classId.toString());
  }
  if (params.section) {
    query = query.eq('section', params.section);
  }
  if (params.q) {
    const q = params.q;
    query = query.or(`name.ilike.%${q}%,roll_number.ilike.%${q}%`);
  }

  const { data: studentsData, error: studentError } = await query;
  if (studentError) throw studentError;

  // Then get fees for these students
  const studentIds = studentsData.map(s => s.id);
  
  if (studentIds.length === 0) return [];

  const { data: feesData, error: feeError } = await supabase.from('student_fee_records').select('*').in('student_id', studentIds);

  if (feeError) throw feeError;

  const { data: sportsData } = await supabase.from('student_sports').select('*, sport:sports(*)').in('student_id', studentIds);

  return studentsData.map(s => {
    const studentFees = feesData?.filter(fee => fee.student_id === s.id) || [];
    const ss = sportsData?.filter(sport => sport.student_id === s.id) || [];

    const totalFee = studentFees.reduce((sum, f) => sum + Number(f.amount), 0);
    const paidAmount = studentFees.reduce((sum, f) => sum + Number(f.paid_amount), 0);
    const dueAmount = totalFee - paidAmount;

    // Shape student
    const studentObj = {
      id: s.id,
      name: s.name,
      rollNumber: s.roll_number,
      class: s.class_id,
      section: s.section
    } as any;

    // Shape fees
    const feesObj = {
      studentId: s.id,
      totalFee: totalFee,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      lastPaymentDate: studentFees[0]?.updated_at || null,
      lastPaymentAmount: studentFees[0]?.last_payment_amount || 0,
      terms: studentFees
    };

    return {
      student: studentObj,
      fees: feesObj,
      sports: ss
    };
  });
};

// Complaints
export const getComplaints = async () => {
  const { data, error } = await supabase.from('complaints').select(`
    id, category, date, text, status, studentId:student_id,
    title, description, createdAt:created_at
  `).order('date', { ascending: false });

  if (error) throw error;

  // Return complaints without studentId for anonymity (as per original logic, but here we just strip it)
  // Logic says: "Return complaints without studentId".
  // Note: in DB we fetch it, but we can return object without it.
  return data.map(({ studentId, ...complaint }: any) => ({
    ...complaint,
    title: complaint.title || complaint.category, // Handle legacy/new fields
    description: complaint.description || complaint.text,
    createdAt: complaint.createdAt || complaint.date,
  }));
};

export const createComplaint = async (complaint: { category: string; text: string; studentId: string }) => {
  const dbComplaint = {
    category: complaint.category,
    text: complaint.text,
    student_id: complaint.studentId,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    title: complaint.category, // Map category to title for consistency if needed or keep separate
    description: complaint.text
  };

  const { data, error } = await supabase.from('complaints').insert(dbComplaint).select(`
    id, category, date, text, status, studentId:student_id,
    title, description, createdAt:created_at
  `).single();

  if (error) throw error;
  return data;
};

export const resolveComplaint = async (id: string) => {
  const { data, error } = await supabase.from('complaints').update({ status: 'resolved' }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};

// Attendance
export const getAttendanceByStudent = async (studentId: string, limit: number = 30) => {
  const { data, error } = await supabase.from('attendance_records')
    .select('id, studentId:student_id, date, status')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AttendanceRecord[];
};

export const getAttendanceByClassAndDate = async (classId: string, section: string, date: string) => {
  // First get students in this class to filter (or we can join if we had explicit class relations in attendance, 
  // but attendance links to students. So we can join students.)

  const { data, error } = await supabase.from('attendance_records')
    .select(`
      id, studentId:student_id, date, status,
      students!inner ( class_id, section )
    `)
    .eq('date', date)
    .eq('students.class_id', classId)
    .eq('students.section', section);

  if (error) throw error;
  return data.map((r: any) => ({
    id: r.id,
    studentId: r.studentId,
    date: r.date,
    status: r.status
  })) as AttendanceRecord[];
};

export const markAttendanceBatch = async (params: {
  classId: string;
  section: string;
  date: string;
  marks: Array<{ studentId: string; status: 'present' | 'absent' | 'late' | 'excused' }>;
}) => {
  const records = params.marks.map(m => ({
    student_id: m.studentId,
    date: params.date,
    status: m.status
  }));

  if (records.length > 0) {
    // Upsert is much faster than Delete + Insert
    // Requires UNIQUE constraint on (student_id, date)
    const { error } = await supabase
      .from('attendance_records')
      .upsert(records, { onConflict: 'student_id, date' });

    if (error) throw error;
  }

  // Send SMS to parents of absent students via TextBee
  const absentStudentIds = params.marks
    .filter(m => m.status === 'absent')
    .map(m => m.studentId);

  let notificationCount = 0;

  if (absentStudentIds.length > 0) {
    // Fetch name + parent contact for each absent student
    const { data: absentStudents, error: fetchError } = await supabase
      .from('students')
      .select('id, name, parent_name, parent_phone')
      .in('id', absentStudentIds);

    if (!fetchError && absentStudents) {
      const formattedDate = new Date(params.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      });

      for (const student of absentStudents) {
        if (student.parent_phone) {
          const message =
            `Dear ${student.parent_name || 'Parent'}, your child ${student.name} ` +
            `(Class ${params.classId}-${params.section}) was marked ABSENT on ${formattedDate}. ` +
            `Please contact the school for more information.`;

          try {
            await fetch('/api/send-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: student.parent_phone, message }),
            });
            notificationCount++;
            console.log(`[SMS] Sent absence alert to parent of ${student.name}`);
          } catch (smsError) {
            // SMS failure should never block attendance saving
            console.error(`[SMS] Failed to notify parent of ${student.name}:`, smsError);
          }
        }
      }
    }
  }

  return { success: true, recordsAdded: records.length, notificationCount };
};

// Academic records
export const getAcademicsByStudent = async (studentId: string) => {
  const { data, error } = await supabase.from('academic_records')
    .select('studentId:student_id, subject, marks, totalMarks:total_marks, grade, term')
    .eq('student_id', studentId);

  if (error) throw error;
  return data as AcademicRecord[];
};

export const updateAcademicRecordBatch = async (params: {
  classId: string;
  section: string;
  subject: string;
  term: string;
  marks: Array<{ studentId: string; marks: number; totalMarks: number; }>;
}) => {
  // Calculate grades and insert
  const records = params.marks.map(mark => {
    let grade = 'F';
    const percentage = (mark.marks / mark.totalMarks) * 100;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    return {
      student_id: mark.studentId,
      subject: params.subject,
      term: params.term,
      marks: mark.marks,
      total_marks: mark.totalMarks,
      grade
    };
  });

  if (records.length > 0) {
    // Upsert is much faster than Delete + Insert
    // Requires UNIQUE constraint on (student_id, subject, term)
    const { error } = await supabase
      .from('academic_records')
      .upsert(records, { onConflict: 'student_id, subject, term' });

    if (error) throw error;
  }

  return { success: true };
};

// Homework
export const getHomework = async (params: { classId: string; section?: string }) => {
  let query = supabase.from('homeworks').select(`
    id, class:class_grade, section, subject, title, description,
    dueDate:due_date, createdBy:created_by, createdAt:created_at
  `).order('created_at', { ascending: false });

  if (params.classId) {
    query = query.eq('class_grade', params.classId);
  }
  if (params.section) {
    query = query.eq('section', params.section);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Homework[];
};

export const createHomework = async (homework: Omit<Homework, 'id' | 'createdAt'>) => {
  const dbHomework = {
    class_grade: homework.class,
    section: homework.section,
    subject: homework.subject,
    title: homework.title,
    description: homework.description,
    due_date: homework.dueDate,
    created_by: homework.createdBy
  };

  const { data, error } = await supabase.from('homeworks').insert(dbHomework).select(`
    id, class:class_grade, section, subject, title, description,
    dueDate:due_date, createdBy:created_by, createdAt:created_at
  `).single();

  if (error) throw error;
  return data as Homework;
};

// Sports
export const getSports = async () => {
  const { data, error } = await supabase.from('sports').select('*').order('name');
  if (error) {
    console.error(error);
    return []; // fallback
  }
  return data;
};

export const getStudentSports = async (studentId: string) => {
  const { data, error } = await supabase.from('student_sports').select('*, sport:sports(*)').eq('student_id', studentId);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
};

export const enrollStudentSport = async (studentId: string, sportId: string) => {
  const { data, error } = await supabase.from('student_sports').insert({ student_id: studentId, sport_id: sportId }).select().single();
  if (error) throw error;
  return data;
};

export const unenrollStudentSport = async (studentId: string, sportId: string) => {
  const { error } = await supabase.from('student_sports').delete().eq('student_id', studentId).eq('sport_id', sportId);
  if (error) throw error;
  return true;
};

export const payStudentSport = async (studentId: string, sportId: string, amount: number) => {
  const { data: curr } = await supabase.from('student_sports').select('paid_amount').eq('student_id', studentId).eq('sport_id', sportId).single();
  const newAmount = (Number(curr?.paid_amount) || 0) + Number(amount);
  
  const { data, error } = await supabase.from('student_sports').update({ 
    paid_amount: newAmount, 
    payment_date: new Date().toISOString().split('T')[0],
    status: 'paid' 
  }).eq('student_id', studentId).eq('sport_id', sportId).select().single();
  
  if (error) throw error;
  return data;
};

// Academic Components
export const getAcademicComponents = async () => {
  const { data, error } = await supabase.from('academic_components').select('*').order('name');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
};

export const getStudentAcademicComponents = async (studentId: string) => {
  const { data, error } = await supabase.from('student_academic_components').select('*, component:academic_components(*)').eq('student_id', studentId);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
};

export const upsertStudentAcademicComponent = async (studentId: string, componentId: string, term: string, marks: number) => {
  const { data, error } = await supabase.from('student_academic_components')
    .upsert({ student_id: studentId, component_id: componentId, term, marks }, { onConflict: 'student_id, component_id, term' })
    .select().single();
  if (error) throw error;
  return data;
};

export const createSport = async (name: string, fee: number) => {
  const { data, error } = await supabase.from('sports').insert({ name, fee }).select().single();
  if (error) throw error;
  return data;
};

export const createAcademicComponent = async (name: string) => {
  const { data, error } = await supabase.from('academic_components').insert({ name }).select().single();
  if (error) throw error;
  return data;
};

export default {
  getClasses,
  getSections,
  getStudents,
  getStudentStats,
  getStudentById,
  getTeachers,
  getTeacherById,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getHolidays,
  getTodayHoliday,
  getFees,
  updateFeeRecord,
  getStudentFees,
  getComplaints,
  createComplaint,
  resolveComplaint,
  getAttendanceByStudent,
  getAttendanceByClassAndDate,
  markAttendanceBatch,
  getAcademicsByStudent,
  updateAcademicRecordBatch,
  createStudent,
  updateStudent,
  createTeacher,
  updateTeacher,
  getHomework,
  createHomework,
  getSports,
  getStudentSports,
  enrollStudentSport,
  unenrollStudentSport,
  payStudentSport,
  getAcademicComponents,
  getStudentAcademicComponents,
  upsertStudentAcademicComponent,
};
