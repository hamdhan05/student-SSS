import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PrivateRoute from '@/components/Auth/PrivateRoute';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import AttendanceBatchControls from '@/components/Attendance/AttendanceBatchControls';
import StudentList from '@/components/Students/StudentList';
import Calendar from '@/components/UI/Calendar';
import Button from '@/components/UI/Button';

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
      // Mock save - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Saving attendance:', records);
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  const handleBatchUpdate = (studentIds: string[], status: 'present' | 'absent' | 'late') => {
    // Implement batch update logic
    console.log('Batch update:', studentIds, status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PrivateRoute allowedRoles={['teacher', 'headmaster']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{teacher?.name}</h1>
                <p className="text-gray-600">{teacher?.subject} Teacher</p>
                <p className="text-sm text-gray-500">{teacher?.email}</p>
              </div>
              <Button onClick={() => router.push('/logout')} variant="secondary">
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'attendance'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'students'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Students
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <AttendanceBatchControls
                  studentIds={students.map((s) => s.id)}
                  date={selectedDate}
                  onBatchUpdate={handleBatchUpdate}
                />
                <div className="mt-6">
                  <AttendanceGrid
                    students={students}
                    date={selectedDate}
                    onSaveAttendance={handleSaveAttendance}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <StudentList
                students={students}
                onStudentClick={(student) => router.push(`/students/${student.id}`)}
              />
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
