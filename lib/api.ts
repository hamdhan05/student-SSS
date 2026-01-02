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
  await delay();
  return classes;
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
    id, name, rollNumber:roll_number, class:class_grade, section, photo,
    dateOfBirth:dob, gender, email, phone, address,
    parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
    admissionDate:admission_date, admissionNumber:admission_number, emisNumber:emis_number
  `, { count: 'exact' });

  if (params?.classId) {
    query = query.eq('class_grade', params.classId.toString());
  }

  if (params?.section) {
    query = query.eq('section', params.section);
  }

  if (params?.q) {
    const q = params.q;
    query = query.or(`name.ilike.%${q}%,roll_number.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  query = query.range(start, end);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data: data as unknown as Student[], // Type assertion due to aliasing
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createStudent = async (student: Omit<Student, 'id' | 'admissionDate'>) => {
  // Map camelCase to snake_case
  const dbStudent = {
    name: student.name,
    roll_number: student.rollNumber,
    class_grade: student.class,
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
    // admission_date: default provided by DB or handled here? DB has default current_date.
  };

  const { data, error } = await supabase.from('students').insert(dbStudent).select(`
     id, name, rollNumber:roll_number, class:class_grade, section, photo,
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
      id, name, rollNumber:roll_number, class:class_grade, section, photo,
      dateOfBirth:dob, gender, email, phone, address,
      parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
      admissionDate:admission_date,
      guardianName:guardian_name, guardianPhone:guardian_phone,
      admissionNumber:admission_number, emisNumber:emis_number,
      fee_records (*),
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
  const feesData = Array.isArray(student.fee_records) ? student.fee_records[0] : student.fee_records;

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

export const updateStudent = async (student: Student) => {
  const dbStudent = {
    name: student.name,
    roll_number: student.rollNumber,
    class_grade: student.class,
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
  };

  const { data, error } = await supabase.from('students').update(dbStudent).eq('id', student.id).select(`
     id, name, rollNumber:roll_number, class:class_grade, section, photo,
    dateOfBirth:dob, gender, email, phone, address,
    parentName:parent_name, parentPhone:parent_phone, parentEmail:parent_email,
    admissionDate:admission_date
  `).single();

  if (error) throw error;
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
  let query = supabase.from('students').select('id, name, roll_number, class_grade, section');

  if (params.classId) {
    query = query.eq('class_grade', params.classId);
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
  // Ideally we use a join, but for simplicity/mapping to current structure:
  const studentIds = studentsData.map(s => s.id);
  const { data: feesData, error: feeError } = await supabase.from('fee_records').select('*').in('student_id', studentIds);

  if (feeError) throw feeError;

  return studentsData.map(s => {
    const f = feesData?.find(fee => fee.student_id === s.id);

    // Shape student
    const studentObj = {
      id: s.id,
      name: s.name,
      rollNumber: s.roll_number,
      class: s.class_grade,
      section: s.section
    } as any;

    // Shape fees
    const feesObj = f ? {
      id: f.id,
      studentId: f.student_id,
      totalFee: f.total_fee,
      paidAmount: f.paid_amount,
      dueAmount: f.due_amount,
      lastPaymentDate: f.last_payment_date,
      lastPaymentAmount: f.last_payment_amount,
      terms: f.terms
    } : {
      totalFee: 50000,
      paidAmount: 0,
      dueAmount: 50000,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
    };

    return {
      student: studentObj,
      fees: feesObj
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
      students!inner ( class_grade, section )
    `)
    .eq('date', date)
    .eq('students.class_grade', classId)
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

  // SIMULATION: Send SMS (Log only)
  let notificationCount = 0;
  params.marks.forEach(mark => {
    if (mark.status === 'absent') {
      notificationCount++;
    }
  });
  console.log(`[Mock SMS] Sent ${notificationCount} ABSENT notifications.`);

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

export default {
  getClasses,
  getSections,
  getStudents,
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
};
