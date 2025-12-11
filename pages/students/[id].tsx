import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PrivateRoute from '@/components/Auth/PrivateRoute';
import Button from '@/components/UI/Button';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  class: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
}

export default function StudentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const fetchStudentData = async () => {
    try {
      // Mock student data - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockStudent = {
        id: id as string,
        name: 'Alice Johnson',
        rollNumber: '001',
        grade: '10',
        class: '10A',
        email: 'alice.johnson@student.school.com',
        phone: '+1234567890',
        dateOfBirth: '2008-05-15',
        address: '123 Main Street, City',
        parentName: 'Robert Johnson',
        parentPhone: '+1234567899',
      };

      setStudent(mockStudent);

      // Mock attendance data
      const mockAttendance = [
        { date: '2024-12-10', status: 'present' as const },
        { date: '2024-12-09', status: 'present' as const },
        { date: '2024-12-08', status: 'late' as const },
        { date: '2024-12-07', status: 'present' as const },
        { date: '2024-12-06', status: 'absent' as const },
      ];

      setAttendanceRecords(mockAttendance);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = () => {
    if (attendanceRecords.length === 0) return 0;
    const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
    return ((presentCount / attendanceRecords.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Not Found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button onClick={() => router.back()} variant="secondary" size="sm">
                ← Back
              </Button>
              <Button onClick={() => router.push('/logout')} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
                <p className="text-gray-600">Roll Number: {student.rollNumber}</p>
                <p className="text-gray-600">
                  {student.class} - Grade {student.grade}
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="space-y-3">
                {student.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                )}
                {student.dateOfBirth && (
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{student.dateOfBirth}</p>
                  </div>
                )}
                {student.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{student.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Parent Information</h2>
              <div className="space-y-3">
                {student.parentName && (
                  <div>
                    <p className="text-sm text-gray-600">Parent Name</p>
                    <p className="font-medium">{student.parentName}</p>
                  </div>
                )}
                {student.parentPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Parent Phone</p>
                    <p className="font-medium">{student.parentPhone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Attendance Record</h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">{calculateAttendanceRate()}%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">No attendance records found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
