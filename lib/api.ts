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
  Homework,
  homeworks,
  notifications,
  Notification
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
  return holidays.find(h => h.date === today) || null;
};

// Fees
export const getFees = async (studentId: string) => {
  await delay();
  return feeRecords.find(f => f.studentId === studentId) || null;
};

export const updateFeeRecord = async (studentId: string, terms: any[]) => {
  await delay();
  const index = feeRecords.findIndex(f => f.studentId === studentId);
  if (index === -1) throw new Error('Fee record not found');

  // Recalculate totals
  const totalFee = terms.reduce((acc, t) => acc + t.amount, 0);
  const paidAmount = terms.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const dueAmount = totalFee - paidAmount;

  feeRecords[index] = {
    ...feeRecords[index],
    terms,
    totalFee,
    paidAmount,
    dueAmount,
    lastPaymentDate: new Date().toISOString().split('T')[0],
  };

  return feeRecords[index];
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

  // SIMULATION: Send SMS for absent students
  let notificationCount = 0;
  params.marks.forEach(mark => {
    if (mark.status === 'absent') {
      const student = students.find(s => s.id === mark.studentId);
      if (student) {
        notifications.push({
          id: `notif_${Date.now()}_${student.id}`,
          studentId: student.id,
          type: 'sms',
          message: `Dear Parent, your child ${student.name} is marked ABSENT today (${params.date}).`,
          status: 'sent',
          timestamp: new Date().toISOString(),
        });
        notificationCount++;
      }
    }
  });

  return { success: true, recordsAdded: newRecords.length, notificationCount };
};

// Academic records
export const getAcademicsByStudent = async (studentId: string) => {
  await delay();
  return academicRecords.filter(a => a.studentId === studentId);
};

export const updateAcademicRecordBatch = async (params: {
  classId: string;
  section: string;
  subject: string;
  term: string;
  marks: Array<{ studentId: string; marks: number; totalMarks: number; }>;
}) => {
  await delay();

  // Remove existing records for this subject/term/student to avoid duplicates
  params.marks.forEach(mark => {
    const existingIndex = academicRecords.findIndex(
      r => r.studentId === mark.studentId && r.subject === params.subject && r.term === params.term
    );
    if (existingIndex !== -1) {
      academicRecords.splice(existingIndex, 1);
    }

    // Calculate grade
    let grade = 'F';
    const percentage = (mark.marks / mark.totalMarks) * 100;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    academicRecords.push({
      studentId: mark.studentId,
      subject: params.subject,
      term: params.term,
      marks: mark.marks,
      totalMarks: mark.totalMarks,
      grade
    });
  });

  return { success: true };
};

// Homework
export const getHomework = async (params: { classId: string; section?: string }) => {
  await delay();
  let filtered = [...homeworks];

  if (params.classId) {
    filtered = filtered.filter(h => h.class === params.classId);
  }

  if (params.section) {
    filtered = filtered.filter(h => h.section === params.section);
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createHomework = async (homework: Omit<Homework, 'id' | 'createdAt'>) => {
  await delay();
  const newHomework: Homework = {
    ...homework,
    id: `hw${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  homeworks.push(newHomework);
  return newHomework;
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
