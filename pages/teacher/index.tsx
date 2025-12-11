import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClasses, getSections, getStudents, markAttendanceBatch } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import StudentDetailModal from '@/components/Modals/StudentDetailModal';

export default function TeacherPortal() {
  const { user, loading } = useRequireAuth(['teacher']);
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<number>(9);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'present' | 'absent'>>({});
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => getSections(),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', selectedClass, selectedSection],
    queryFn: () =>
      getStudents({
        classId: selectedClass,
        section: selectedSection,
        page: 1,
        limit: 100,
      }),
    enabled: !!selectedClass && !!selectedSection,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: markAttendanceBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      alert('Attendance marked successfully!');
      setAttendanceMarks({});
    },
  });

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceMarks((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const marks: Record<string, 'present' | 'absent'> = {};
    studentsData?.data.forEach((student: any) => {
      marks[student.id] = status;
    });
    setAttendanceMarks(marks);
  };

  const handleSubmitAttendance = () => {
    const marks = Object.entries(attendanceMarks).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (marks.length === 0) {
      alert('Please mark attendance for at least one student');
      return;
    }

    markAttendanceMutation.mutate({
      classId: selectedClass,
      section: selectedSection,
      date: selectedDate,
      marks,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teacher Portal</h1>
            <p className="text-gray-400">Welcome, {user.name}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('authUser');
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-red-900 bg-opacity-50 text-white rounded hover:bg-opacity-70"
          >
            Logout
          </button>
        </div>

        {/* Attendance Section */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mark Attendance</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white bg-opacity-10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
                >
                  {classes.map((cls: any) => (
                    <option key={cls} value={cls} className="bg-black">
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
                >
                  {sections.map((sec: any) => (
                    <option key={sec} value={sec} className="bg-black">
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button onClick={() => handleMarkAll('present')} variant="success">
                Mark All Present
              </Button>
              <Button onClick={() => handleMarkAll('absent')} variant="danger">
                Mark All Absent
              </Button>
            </div>
          </div>

          {studentsLoading ? (
            <div className="card p-8 text-center text-gray-400">Loading students...</div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Roll No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student Name</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Attendance</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData?.data.map((student: any) => {
                      const status = attendanceMarks[student.id] || 'present';
                      return (
                        <tr key={student.id} className="border-b border-gray-800 hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4 text-sm text-gray-300">{student.rollNumber}</td>
                          <td className="px-6 py-4 text-sm text-white font-medium">{student.name}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() =>
                                  setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'present' }))
                                }
                                className={`px-4 py-2 rounded font-medium transition-colors ${
                                  status === 'present'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'absent' }))}
                                className={`px-4 py-2 rounded font-medium transition-colors ${
                                  status === 'absent'
                                    ? 'bg-red-700 text-white'
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setViewStudentId(student.id)}
                              className="text-white hover:text-gray-300 text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={markAttendanceMutation.isPending || Object.keys(attendanceMarks).length === 0}
                  className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg"
                >
                  {markAttendanceMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Student Detail Modal (View Only) */}
      {viewStudentId && (
        <StudentDetailModal
          isOpen={!!viewStudentId}
          onClose={() => setViewStudentId(null)}
          studentId={viewStudentId}
          showEdit={false}
        />
      )}
    </div>
  );
}