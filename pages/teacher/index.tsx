import { useRequireAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/UI/Layout';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClasses, getSections, getStudents, markAttendanceBatch, getTeacherById, getNotices } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import StudentDetailModal from '@/components/Modals/StudentDetailModal';
import TeacherHomework from '@/components/Teacher/Homework';
import TeacherMarks from '@/components/Teacher/Marks';

export default function TeacherPortal() {
  const { user, loading } = useRequireAuth(['teacher']);
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'present' | 'absent'>>({});
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: teacher } = useQuery({
    queryKey: ['teacher', user?.id],
    queryFn: () => getTeacherById(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: notices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const assignedClasses = teacher?.classes || [];

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  // Extract unique class numbers from assigned classes (e.g. "10A", "9B" -> [10, 9])
  const availableClasses = classes.filter((cls: any) =>
    assignedClasses.some((ac: string) => ac.startsWith(String(cls)))
  );

  // Extract sections for the selected class from assigned classes
  const availableSections = assignedClasses
    .filter((ac: string) => ac.startsWith(String(selectedClass)))
    .map((ac: string) => ac.replace(String(selectedClass), ''));

  /* Removed getSections query as we filter from assignedClasses */

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
      classId: String(selectedClass),
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

  const router = require('next/router').useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    router.push('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Attendance', icon: '📝' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
    { id: 'homework', label: 'Homework', icon: '📚' },
    { id: 'marks', label: 'Marks', icon: '📊' },
    { id: 'notices', label: 'Notices', icon: '📢' },
  ];

  return (
    <Layout
      title="Teacher Portal"
      user={{
        ...user,
        role: user.role || undefined,
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto p-0 rounded-lg">
        {activeTab === 'timetable' ? (
          <div className="card p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Timetable</h2>
            <div className="min-w-full inline-block align-middle">
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr className="bg-black bg-opacity-30">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-700">Time</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <th key={day} className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-700 last:border-r-0">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00'].map((time, i) => (
                      <tr key={time} className={i % 2 === 0 ? 'bg-white bg-opacity-5' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 border-r border-gray-700">{time}</td>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, j) => {
                          // Deterministic pseudo-random distribution of assigned classes
                          const hasClass = assignedClasses.length > 0 && (i + j + assignedClasses.length) % 3 !== 0; // Some gaps
                          const classIndex = (i + j) % assignedClasses.length;
                          const assignedClass = hasClass ? assignedClasses[classIndex] : null;

                          return (
                            <td key={day} className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-700 last:border-r-0">
                              {assignedClass ? (
                                <div className="inline-flex flex-col items-center justify-center px-3 py-1 rounded-md bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30 text-blue-200">
                                  <span className="font-bold">Class {assignedClass}</span>
                                  <span className="text-xs opacity-75">Room {100 + Number(assignedClass.replace(/\D/g, ''))}</span>
                                </div>
                              ) : (
                                <span className="text-gray-600 text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          /* Attendance Section */
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Mark Attendance</h2>
                {assignedClasses.length > 0 && (
                  <div className="px-4 py-2 bg-blue-500 bg-opacity-20 rounded-lg border border-blue-500 border-opacity-30">
                    <span className="text-blue-300 text-sm font-medium">Assigned Classes: </span>
                    <span className="text-white font-bold">{assignedClasses.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor="date-input" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <Input
                    id="date-input"
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white bg-opacity-10 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="class-select" className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                  <select
                    id="class-select"
                    name="class"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(Number(e.target.value));
                      setSelectedSection(''); // Reset section when class changes
                    }}
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
                  >
                    <option value={0}>Select Class</option>
                    {availableClasses.map((cls: any) => (
                      <option key={cls} value={cls} className="bg-black">
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="section-select" className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                  <select
                    id="section-select"
                    name="section"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
                    disabled={!selectedClass}
                  >
                    <option value="">Select Section</option>
                    {availableSections.map((sec: any) => (
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
                                  className={`px-4 py-2 rounded font-medium transition-colors ${status === 'present'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                    }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'absent' }))}
                                  className={`px-4 py-2 rounded font-medium transition-colors ${status === 'absent'
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
        ) : null}
      </div>

      {/* Student Detail Modal (View Only) */}
      {
        viewStudentId && (
          <StudentDetailModal
            isOpen={!!viewStudentId}
            onClose={() => setViewStudentId(null)}
            studentId={viewStudentId}
            showEdit={false}
          />
        )
      }



      {activeTab === 'homework' && (
        <TeacherHomework assignedClasses={assignedClasses} />
      )}

      {activeTab === 'marks' && (
        <TeacherMarks assignedClasses={assignedClasses} />
      )}

      {activeTab === 'notices' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Notice Board</h2>
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <div key={notice.id} className="card p-6 border-l-4 border-yellow-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{notice.title}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{notice.content}</p>
                <div className="mt-4 text-xs text-gray-500">Posted by: {notice.createdBy}</div>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="card p-8 text-center text-gray-400">No notices available</div>
            )}
          </div>
        </div>
      )}
    </Layout >
  );
}