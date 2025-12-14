import {
  students,
  teachers,
  notices,
  holidays,
  feeRecords,
  complaints,
  attendanceRecords,
  academicRecords,
  classes,
  sections,
  Student,
  Teacher,
  Notice,
  Holiday,
  FeeRecord,
  Complaint,
  AttendanceRecord,
  AcademicRecord,
} from './mockData';

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
  await delay();

  let filtered = [...students];

  if (params?.classId) {
    const classStr = params.classId.toString();
    filtered = filtered.filter(s => s.class === classStr);
  }

  if (params?.section) {
    filtered = filtered.filter(s => s.section === params.section);
  }

  if (params?.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.rollNumber.includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
  };
};

export const createStudent = async (student: Omit<Student, 'id' | 'admissionDate'>) => {
  await delay();
  const newStudent: Student = {
    ...student,
    id: `s${Date.now()}`,
    admissionDate: new Date().toISOString().split('T')[0],
    photo: '/images/students/default.jpg',
  };
  students.push(newStudent);
  return newStudent;
};

export const getStudentById = async (id: string) => {
  await delay();
  const student = students.find(s => s.id === id);
  if (!student) throw new Error('Student not found');

  const fees = feeRecords.find(f => f.studentId === id);
  const academics = academicRecords.filter(a => a.studentId === id);
  const attendance = attendanceRecords.filter(a => a.studentId === id);

  // Calculate attendance percentage
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return {
    ...student,
    guardianName: student.parentName,
    guardianPhone: student.parentPhone,
    academics: academics,
    fees: fees || {
      totalFee: 50000,
      paidAmount: 0,
      dueAmount: 50000,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
    },
    attendance,
    attendancePercentage,
  };
};

// Teachers
export const getTeachers = async () => {
  await delay();
  return teachers.map(t => ({
    ...t,
    subject: t.domain,
    classes: t.classes || [],
  }));
};

export const createTeacher = async (teacher: Omit<Teacher, 'id' | 'joiningDate'>) => {
  await delay();
  const newTeacher: Teacher = {
    ...teacher,
    id: `t${Date.now()}`,
    joiningDate: new Date().toISOString().split('T')[0],
    photo: '/images/teachers/default.jpg',
  };
  teachers.push(newTeacher);
  return newTeacher;
};

export const getTeacherById = async (id: string) => {
  await delay();
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) throw new Error('Teacher not found');
  return teacher;
};

export const updateStudent = async (student: Student) => {
  await delay();
  const index = students.findIndex((s) => s.id === student.id);
  if (index !== -1) {
    students[index] = student;
    return student;
  }
  throw new Error('Student not found');
};

export const updateTeacher = async (teacher: Teacher) => {
  await delay();
  const index = teachers.findIndex((t) => t.id === teacher.id);
  if (index !== -1) {
    teachers[index] = teacher;
    return teacher;
  }
  throw new Error('Teacher not found');
};

// Notices
export const getNotices = async () => {
  await delay();
  return [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const createNotice = async (notice: Omit<Notice, 'id'>) => {
  await delay();
  const newNotice = {
    ...notice,
    id: `n${Date.now()}`,
  };
  notices.push(newNotice);
  return newNotice;
};

export const updateNotice = async (id: string, updates: Partial<Notice>) => {
  await delay();
  const index = notices.findIndex(n => n.id === id);
  if (index === -1) throw new Error('Notice not found');
  notices[index] = { ...notices[index], ...updates };
  return notices[index];
};

export const deleteNotice = async (id: string) => {
  await delay();
  const index = notices.findIndex(n => n.id === id);
  if (index === -1) throw new Error('Notice not found');
  notices.splice(index, 1);
  return { success: true };
};

// Holidays
export const getHolidays = async (year: number = new Date().getFullYear()) => {
  await delay();
  return holidays.filter(h => new Date(h.date).getFullYear() === year);
};

export const getTodayHoliday = async () => {
  await delay();
  const today = new Date().toISOString().split('T')[0];
  return holidays.find(h => h.date === today);
};

// Fees
export const getFees = async (studentId: string) => {
  await delay();
  return feeRecords.find(f => f.studentId === studentId) || null;
};

export const getStudentFees = async (params: { classId?: string; section?: string; q?: string }) => {
  await delay();
  let filtered = [...students];

  if (params.classId) {
    filtered = filtered.filter(s => s.class === params.classId);
  }

  if (params.section) {
    filtered = filtered.filter(s => s.section === params.section);
  }

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) || s.rollNumber.includes(query)
    );
  }

  return filtered.map(student => {
    const fees = feeRecords.find(f => f.studentId === student.id) || {
      totalFee: 50000,
      paidAmount: 0,
      dueAmount: 50000,
      lastPaymentDate: null,
      lastPaymentAmount: 0,
    };

    return {
      student,
      fees,
    };
  });
};

// Complaints
export const getComplaints = async () => {
  await delay();
  // Return complaints without studentId for anonymity
  return complaints.map(({ studentId, ...complaint }) => ({
    ...complaint,
    title: complaint.category,
    description: complaint.text,
    createdAt: complaint.date,
  }));
};

export const createComplaint = async (complaint: { category: string; text: string; studentId: string }) => {
  await delay();
  const newComplaint = {
    ...complaint,
    id: `c${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
  };
  complaints.push(newComplaint);
  return newComplaint;
};

export const resolveComplaint = async (id: string) => {
  await delay();
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('Complaint not found');
  complaint.status = 'resolved';
  return complaint;
};

// Attendance
export const getAttendanceByStudent = async (studentId: string, limit: number = 30) => {
  await delay();
  return attendanceRecords
    .filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const markAttendanceBatch = async (params: {
  classId: string;
  section: string;
  date: string;
  marks: Array<{ studentId: string; status: 'present' | 'absent' | 'late' | 'excused' }>;
}) => {
  await delay();

  // Remove existing attendance for this date and class/section
  const studentsInClass = students.filter(
    s => s.class === params.classId && s.section === params.section
  ).map(s => s.id);

  const filtered = attendanceRecords.filter(
    a => !(studentsInClass.includes(a.studentId) && a.date === params.date)
  );

  // Add new attendance records
  const newRecords = params.marks.map(mark => ({
    id: `a${Date.now()}_${mark.studentId}`,
    studentId: mark.studentId,
    date: params.date,
    status: mark.status,
  }));

  attendanceRecords.length = 0;
  attendanceRecords.push(...filtered, ...newRecords);

  return { success: true, recordsAdded: newRecords.length };
};

// Academic records
export const getAcademicsByStudent = async (studentId: string) => {
  await delay();
  return academicRecords.filter(a => a.studentId === studentId);
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
  getStudentFees,
  getComplaints,
  createComplaint,
  resolveComplaint,
  getAttendanceByStudent,
  markAttendanceBatch,
  getAcademicsByStudent,
  createStudent,
  updateStudent,
  createTeacher,
  updateTeacher,
};
