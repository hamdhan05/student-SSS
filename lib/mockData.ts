// Types for the school management system

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  photo: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  admissionDate: string;
  admissionNumber?: string;
  emisNumber?: string;
  academicYear?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
  academics?: AcademicRecord[];
}

export interface Teacher {
  id: string;
  name: string;
  photo: string;
  domain: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  joiningDate: string;
  qualification: string;
  experience: string;
  address: string;
  fatherName: string;
  motherName: string;
  subject?: string;
  classes?: string[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  createdBy: string;
  createdAt?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
}

export interface TermFee {
  name: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Notification {
  id: string;
  studentId: string;
  type: 'sms' | 'call';
  message: string;
  status: 'sent';
  timestamp: string;
}

export const notifications: Notification[] = [];

export interface FeeRecord {
  id: string;
  studentId: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  rollNumber?: string;
  studentName?: string;
  class?: string;
  section?: string;
  month?: string;
  amount?: number;
  status?: 'paid' | 'pending';
  terms?: TermFee[];
}

export interface Homework {
  id: string;
  class: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  category: string;
  date: string;
  text: string;
  status: 'pending' | 'resolved';
  studentId: string; // Internal only, not shown to headmaster
  title?: string;
  description?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface AcademicRecord {
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
  term: string;
}

export interface Sport {
  id: string;
  name: string;
  fee: number;
}

export interface StudentSport {
  sportId: string;
  feeAmount: number;
}

export interface AcademicComponent {
  id: string;
  name: string;
}

export interface StudentAcademicComponent {
  componentId: string;
  marks: number;
  term: string;
}

// In-memory data stores (cleared out)
export const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const sections = ['A', 'B', 'C'];

export let students: Student[] = [];
export let teachers: Teacher[] = [];
export let notices: Notice[] = [];
export let holidays: Holiday[] = [];
export let feeRecords: FeeRecord[] = [];
export let homeworks: Homework[] = [];
export let complaints: Complaint[] = [];
export let attendanceRecords: AttendanceRecord[] = [];
export let academicRecords: AcademicRecord[] = [];
export let sports: Sport[] = [];
export let studentSports: StudentSport[] = [];
export let academicComponents: AcademicComponent[] = [];
export let studentAcademicComponents: StudentAcademicComponent[] = [];
