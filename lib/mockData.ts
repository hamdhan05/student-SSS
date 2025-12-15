// Mock data store for the school management system
// All data is in-memory and can be mutated for CRUD operations

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

// In-memory data stores
export const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const sections = ['A', 'B', 'C'];

export let students: Student[] = [
  {
    id: 's1',
    name: 'Alice Johnson',
    rollNumber: '001',
    class: '10',
    section: 'A',
    photo: '/images/students/alice.jpg',
    dateOfBirth: '2008-05-15',
    gender: 'Female',
    email: 'alice.j@student.school.com',
    phone: '+1234567890',
    address: '123 Oak Street, Springfield',
    parentName: 'Robert Johnson',
    parentPhone: '+1234567891',
    parentEmail: 'robert.j@email.com',
    admissionDate: '2020-06-01',
  },
  {
    id: 's2',
    name: 'Bob Williams',
    rollNumber: '002',
    class: '10',
    section: 'A',
    photo: '/images/students/bob.jpg',
    dateOfBirth: '2008-07-22',
    gender: 'Male',
    email: 'bob.w@student.school.com',
    phone: '+1234567892',
    address: '456 Maple Avenue, Springfield',
    parentName: 'Sarah Williams',
    parentPhone: '+1234567893',
    parentEmail: 'sarah.w@email.com',
    admissionDate: '2020-06-01',
  },
  {
    id: 's3',
    name: 'Charlie Brown',
    rollNumber: '003',
    class: '10',
    section: 'B',
    photo: '/images/students/charlie.jpg',
    dateOfBirth: '2008-03-10',
    gender: 'Male',
    email: 'charlie.b@student.school.com',
    phone: '+1234567894',
    address: '789 Pine Road, Springfield',
    parentName: 'David Brown',
    parentPhone: '+1234567895',
    parentEmail: 'david.b@email.com',
    admissionDate: '2020-06-01',
  },
  {
    id: 's4',
    name: 'Diana Martinez',
    rollNumber: '004',
    class: '10',
    section: 'B',
    photo: '/images/students/diana.jpg',
    dateOfBirth: '2008-09-18',
    gender: 'Female',
    email: 'diana.m@student.school.com',
    phone: '+1234567896',
    address: '321 Elm Street, Springfield',
    parentName: 'Maria Martinez',
    parentPhone: '+1234567897',
    parentEmail: 'maria.m@email.com',
    admissionDate: '2020-06-01',
  },
  {
    id: 's5',
    name: 'Eva Davis',
    rollNumber: '005',
    class: '9',
    section: 'A',
    photo: '/images/students/eva.jpg',
    dateOfBirth: '2009-11-05',
    gender: 'Female',
    email: 'eva.d@student.school.com',
    phone: '+1234567898',
    address: '654 Birch Lane, Springfield',
    parentName: 'Thomas Davis',
    parentPhone: '+1234567899',
    parentEmail: 'thomas.d@email.com',
    admissionDate: '2021-06-01',
  },
];

// Generate more students for pagination testing
for (let classNum of ['9', '10', '11']) {
  for (let sec of ['A', 'B', 'C']) {
    for (let i = 6; i <= 25; i++) {
      students.push({
        id: `s${classNum}${sec}${i}`,
        name: `Student ${classNum}${sec}${i}`,
        rollNumber: `${i.toString().padStart(3, '0')}`,
        class: classNum,
        section: sec,
        photo: `/images/students/default.jpg`,
        dateOfBirth: '2008-01-01',
        gender: i % 2 === 0 ? 'Male' : 'Female',
        email: `student${classNum}${sec}${i}@school.com`,
        phone: `+123456${i}`,
        address: `${i} Main St, Springfield`,
        parentName: `Parent ${i}`,
        parentPhone: `+123457${i}`,
        parentEmail: `parent${i}@email.com`,
        admissionDate: '2020-06-01',
      });
    }
  }
}

export let teachers: Teacher[] = [
  {
    id: 't1',
    name: 'John Smith',
    photo: '/images/teachers/john.jpg',
    domain: 'Mathematics',
    email: 'john.smith@school.com',
    phone: '+1234560001',
    dateOfBirth: '1985-03-15',
    joiningDate: '2010-07-01',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experience: '14 years',
    address: '100 Teacher Lane, Springfield',
    fatherName: 'James Smith',
    motherName: 'Mary Smith',
    classes: ['10A', '10B', '11C'],
  },
  {
    id: 't2',
    name: 'Sarah Johnson',
    photo: '/images/teachers/sarah.jpg',
    domain: 'English',
    email: 'sarah.j@school.com',
    phone: '+1234560002',
    dateOfBirth: '1988-06-20',
    joiningDate: '2012-08-15',
    qualification: 'M.A. English Literature, B.Ed.',
    experience: '12 years',
    address: '200 Teacher Lane, Springfield',
    fatherName: 'Robert Johnson',
    motherName: 'Linda Johnson',
  },
  {
    id: 't3',
    name: 'Michael Brown',
    photo: '/images/teachers/michael.jpg',
    domain: 'Science',
    email: 'michael.b@school.com',
    phone: '+1234560003',
    dateOfBirth: '1982-11-10',
    joiningDate: '2008-06-01',
    qualification: 'M.Sc. Physics, B.Ed.',
    experience: '16 years',
    address: '300 Teacher Lane, Springfield',
    fatherName: 'David Brown',
    motherName: 'Susan Brown',
  },
  {
    id: 't4',
    name: 'Emily Davis',
    photo: '/images/teachers/emily.jpg',
    domain: 'History',
    email: 'emily.d@school.com',
    phone: '+1234560004',
    dateOfBirth: '1990-02-28',
    joiningDate: '2014-07-01',
    qualification: 'M.A. History, B.Ed.',
    experience: '10 years',
    address: '400 Teacher Lane, Springfield',
    fatherName: 'Thomas Davis',
    motherName: 'Patricia Davis',
  },
  {
    id: 't5',
    name: 'James Wilson',
    photo: '/images/teachers/james.jpg',
    domain: 'Physical Education',
    email: 'james.w@school.com',
    phone: '+1234560005',
    dateOfBirth: '1987-09-12',
    joiningDate: '2013-08-01',
    qualification: 'B.P.Ed., M.P.Ed.',
    experience: '11 years',
    address: '500 Teacher Lane, Springfield',
    fatherName: 'William Wilson',
    motherName: 'Jennifer Wilson',
  },
];

export let notices: Notice[] = [
  {
    id: 'n1',
    title: 'Winter Break Announcement',
    content: 'School will be closed from December 20th to January 5th for winter break.',
    date: '2025-12-01',
    createdBy: 'Headmaster',
  },
  {
    id: 'n2',
    title: 'Parent-Teacher Meeting',
    content: 'Parent-teacher meeting scheduled for December 15th, 2025 from 9 AM to 2 PM.',
    date: '2025-12-05',
    createdBy: 'Headmaster',
  },
  {
    id: 'n3',
    title: 'Annual Sports Day',
    content: 'Annual sports day will be held on January 20th, 2026. All students must participate.',
    date: '2025-12-10',
    createdBy: 'Admin',
  },
];

export let holidays: Holiday[] = [
  { id: 'h1', date: '2025-12-25', name: 'Christmas Day', type: 'Public Holiday' },
  { id: 'h2', date: '2025-12-31', name: 'New Year Eve', type: 'Public Holiday' },
  { id: 'h3', date: '2026-01-01', name: 'New Year Day', type: 'Public Holiday' },
  { id: 'h4', date: '2026-01-26', name: 'Republic Day', type: 'National Holiday' },
  { id: 'h5', date: '2025-12-12', name: 'School Foundation Day', type: 'School Holiday' },
];

export let feeRecords: FeeRecord[] = [
  {
    id: 'f1',
    studentId: 's1',
    totalFee: 50000,
    paidAmount: 35000,
    dueAmount: 15000,
    lastPaymentDate: '2025-11-15',
    lastPaymentAmount: 10000,
    terms: [
      { name: 'Term 1', amount: 20000, status: 'paid' },
      { name: 'Term 2', amount: 15000, status: 'paid' },
      { name: 'Term 3', amount: 15000, status: 'pending' },
    ]
  },
  {
    id: 'f2',
    studentId: 's2',
    totalFee: 50000,
    paidAmount: 50000,
    dueAmount: 0,
    lastPaymentDate: '2025-10-20',
    lastPaymentAmount: 15000,
    terms: [
      { name: 'Term 1', amount: 20000, status: 'paid' },
      { name: 'Term 2', amount: 15000, status: 'paid' },
      { name: 'Term 3', amount: 15000, status: 'paid' },
    ]
  },
  {
    id: 'f3',
    studentId: 's3',
    totalFee: 50000,
    paidAmount: 25000,
    dueAmount: 25000,
    lastPaymentDate: '2025-09-10',
    lastPaymentAmount: 12500,
    terms: [
      { name: 'Term 1', amount: 20000, status: 'paid' },
      { name: 'Term 2', amount: 15000, status: 'pending' },
      { name: 'Term 3', amount: 15000, status: 'pending' },
    ]
  },
];

export let homeworks: Homework[] = [
  {
    id: 'hw1',
    class: '10',
    section: 'A',
    subject: 'Mathematics',
    title: 'Quadratic Equations Exercise',
    description: 'Complete exercises 4.1 to 4.3 from the textbook. Show all working steps.',
    dueDate: '2025-12-20',
    createdBy: 't1',
    createdAt: '2025-12-14',
  },
  {
    id: 'hw2',
    class: '10',
    section: 'A',
    subject: 'English',
    title: 'Essay Writing',
    description: 'Write an essay on "The Impact of Technology on Education" (500 words).',
    dueDate: '2025-12-18',
    createdBy: 't2',
    createdAt: '2025-12-14',
  },
];

export let complaints: Complaint[] = [
  {
    id: 'c1',
    category: 'Facilities',
    date: '2025-12-08',
    text: 'The water fountain on the second floor is not working properly.',
    status: 'pending',
    studentId: 's1',
  },
  {
    id: 'c2',
    category: 'Bullying',
    date: '2025-12-09',
    text: 'Some senior students are bothering junior students during lunch break.',
    status: 'pending',
    studentId: 's3',
  },
  {
    id: 'c3',
    category: 'Cafeteria',
    date: '2025-12-07',
    text: 'The food quality has decreased recently. Please improve.',
    status: 'resolved',
    studentId: 's2',
  },
];

export let attendanceRecords: AttendanceRecord[] = [
  { id: 'a1', studentId: 's1', date: '2025-12-10', status: 'present' },
  { id: 'a2', studentId: 's1', date: '2025-12-09', status: 'present' },
  { id: 'a3', studentId: 's1', date: '2025-12-08', status: 'late' },
  { id: 'a4', studentId: 's2', date: '2025-12-10', status: 'present' },
  { id: 'a5', studentId: 's2', date: '2025-12-09', status: 'absent' },
];

export let academicRecords: AcademicRecord[] = [
  { studentId: 's1', subject: 'Mathematics', marks: 85, totalMarks: 100, grade: 'A', term: 'Mid-term' },
  { studentId: 's1', subject: 'English', marks: 78, totalMarks: 100, grade: 'B+', term: 'Mid-term' },
  { studentId: 's1', subject: 'Science', marks: 92, totalMarks: 100, grade: 'A+', term: 'Mid-term' },
  { studentId: 's1', subject: 'History', marks: 80, totalMarks: 100, grade: 'A', term: 'Mid-term' },
  { studentId: 's2', subject: 'Mathematics', marks: 72, totalMarks: 100, grade: 'B', term: 'Mid-term' },
  { studentId: 's2', subject: 'English', marks: 88, totalMarks: 100, grade: 'A', term: 'Mid-term' },
];
