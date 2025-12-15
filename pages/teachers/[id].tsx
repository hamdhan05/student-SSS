import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { markAttendanceBatch } from '@/lib/api';
import PrivateRoute from '@/components/Auth/PrivateRoute';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import AttendanceBatchControls from '@/components/Attendance/AttendanceBatchControls';
import StudentList from '@/components/Students/StudentList';
import Calendar from '@/components/UI/Calendar';
import Layout from '@/components/UI/Layout';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  classes: string[];
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  class: string;
}

export default function TeacherPage() {
  const router = useRouter();
  const { id } = router.query;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'attendance' | 'students'>('attendance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTeacherData();
    }
  }, [id]);

  const fetchTeacherData = async () => {
    try {
      // Mock teacher data - replace with real API calls later
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockTeacher = {
        id: id as string,
        name: 'John Smith',
        email: 'john.smith@school.com',
        subject: 'Mathematics',
        classes: ['10A', '10B'],
      };

      setTeacher(mockTeacher);

      // Mock students data
      const mockStudents = [
        { id: '1', name: 'Alice Johnson', rollNumber: '001', grade: '10', class: '10A' },
        { id: '2', name: 'Bob Williams', rollNumber: '002', grade: '10', class: '10A' },
        { id: '3', name: 'Charlie Brown', rollNumber: '003', grade: '10', class: '10B' },
        { id: '4', name: 'Diana Martinez', rollNumber: '004', grade: '10', class: '10B' },
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (records: any[]) => {
    try {
      if (!teacher || !teacher.classes.length) return;
      // Assuming first class/section for now as per current simple implementation
      // In a real app, we'd select the specific class/section
      const [cls, section] = ['10', 'A'];

      const response = await markAttendanceBatch({
        classId: cls,
        section: section,
        date: selectedDate.toISOString().split('T')[0],
        marks: records
      });

      let message = 'Attendance saved successfully!';
      if (response.notificationCount > 0) {
        message += `\n${response.notificationCount} SMS notification(s) sent to parents of absent students.`;
      }
      alert(message);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  const handleBatchUpdate = async (studentIds: string[], status: 'present' | 'absent' | 'late') => {
    const records = studentIds.map(id => ({ studentId: id, status }));
    await handleSaveAttendance(records);
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'students', label: 'Students', icon: '👥' },
  ];

  return (
    <PrivateRoute allowedRoles={['teacher', 'headmaster']}>
      <Layout
        title="Teacher Details"
        user={{ name: 'Headmaster', role: 'headmaster' }} // Assuming context from headmaster view
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-white border-opacity-10 p-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-black bg-opacity-50 border border-gray-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {teacher?.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{teacher?.name}</h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-white bg-opacity-10 text-white text-sm border border-white border-opacity-20">
                    {teacher?.subject} Teacher
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white bg-opacity-10 text-white text-sm border border-white border-opacity-20">
                    {teacher?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white bg-opacity-5 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Batch Actions</h3>
                  <AttendanceBatchControls
                    studentIds={students.map((s) => s.id)}
                    date={selectedDate}
                    onBatchUpdate={handleBatchUpdate}
                  />
                </div>
                <div className="bg-white bg-opacity-5 rounded-xl border border-gray-700 p-6">
                  <AttendanceGrid
                    students={students}
                    date={selectedDate}
                    onSaveAttendance={handleSaveAttendance}
                  />
                </div>
              </div>
              <div>
                <div className="bg-white bg-opacity-5 rounded-xl border border-gray-700 p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-white mb-4">Select Date</h3>
                  <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white bg-opacity-5 rounded-xl border border-gray-700 p-6">
              <StudentList
                students={students}
                onStudentClick={(student) => router.push(`/students/${student.id}`)}
              />
            </div>
          )}
        </div>
      </Layout>
    </PrivateRoute>
  );
}
