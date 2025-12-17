import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentById, getAttendanceByStudent, createComplaint, getNotices } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import Layout from '@/components/UI/Layout';
import StudentHomework from '@/components/Student/Homework';

export default function StudentPortal() {
  const { user, loading } = useRequireAuth(['student']);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'academics' | 'timetable' | 'homework' | 'attendance' | 'complaints' | 'notices'>('academics');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintData, setComplaintData] = useState({ title: '', description: '' });

  // Use the authenticated user's ID
  const studentId = user?.id || '';

  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudentById(studentId),
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => getAttendanceByStudent(studentId),
  });

  const { data: notices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const createComplaintMutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setIsComplaintModalOpen(false);
      setComplaintData({ title: '', description: '' });
      alert('Complaint submitted successfully! Your identity will remain anonymous to the headmaster.');
    },
  });

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    createComplaintMutation.mutate({
      studentId,
      category: 'General', // Default category
      text: complaintData.description,
      ...complaintData,
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

  const tabs = [
    { id: 'academics' as const, label: 'Academics', icon: '📚' },
    { id: 'timetable' as const, label: 'Timetable', icon: '📅' },
    { id: 'homework' as const, label: 'Homework', icon: '📝' },
    { id: 'attendance' as const, label: 'Attendance', icon: '📊' },
    { id: 'notices' as const, label: 'Notices', icon: '📢' },
    { id: 'complaints' as const, label: 'Submit Complaint', icon: '📝' },
  ];

  const presentCount = attendance.filter((a: any) => a.status === 'present').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : '0';

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  const extraSidebarContent = student ? (
    <div className="text-sm text-gray-400 mb-4 px-2">
      <p>Class: {student.class}-{student.section}</p>
      <p>Roll: {student.rollNumber}</p>
    </div>
  ) : null;

  return (
    <Layout
      title="Student Portal"
      user={{
        ...user,
        role: user.role || undefined,
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as any)}
      onLogout={handleLogout}
      extraSidebarContent={extraSidebarContent}
    >
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Academic Performance</h2>

          {student?.academics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.academics.map((record: any) => (
                <div key={record.subject} className="card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">{record.subject}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Test 1:</span>
                      <span className="text-white font-medium">{record.test1}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Test 2:</span>
                      <span className="text-white font-medium">{record.test2}/100</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-3">
                      <span className="text-gray-300 font-semibold">Average:</span>
                      <span className="text-white font-bold text-lg">
                        {((record.test1 + record.test2) / 2).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!student?.academics || student.academics.length === 0) && (
            <div className="card p-8 text-center text-gray-400">No academic records available</div>
          )}
        </div>
      )}



      {activeTab === 'timetable' && (
        <div className="card p-6 overflow-x-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Weekly Timetable</h2>
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
                        // Mock schedule logic
                        const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry'];
                        const subjectIndex = (i + j) % subjects.length;
                        const subject = subjects[subjectIndex];
                        const isBreak = i === 3; // Lunch break at 12:00

                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-700 last:border-r-0">
                            {isBreak ? (
                              <span className="text-gray-500 italic">Lunch Break</span>
                            ) : (
                              <div className="inline-flex flex-col items-center justify-center px-3 py-1 rounded-md bg-purple-500 bg-opacity-20 border border-purple-500 border-opacity-30 text-purple-200">
                                <span className="font-bold">{subject}</span>
                                <span className="text-xs opacity-75">Room {101 + i}</span>
                              </div>
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
      )}



      {
        activeTab === 'homework' && student && (
          <StudentHomework student={student} />
        )
      }

      {
        activeTab === 'attendance' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Attendance Record</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="text-sm text-gray-400 mb-2">Total Days</h3>
                <p className="text-3xl font-bold text-white">{totalDays}</p>
              </div>
              <div className="card p-6 border-green-600">
                <h3 className="text-sm text-gray-400 mb-2">Days Present</h3>
                <p className="text-3xl font-bold text-green-400">{presentCount}</p>
              </div>
              <div className="card p-6">
                <h3 className="text-sm text-gray-400 mb-2">Attendance %</h3>
                <p className="text-3xl font-bold text-white">{attendancePercentage}%</p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record: any) => (
                    <tr key={record.id} className="border-b border-gray-800 hover:bg-white hover:bg-opacity-5">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'present'
                            ? 'bg-green-900 bg-opacity-50 text-green-400'
                            : 'bg-red-900 bg-opacity-50 text-red-400'
                            }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attendance.length === 0 && (
                <div className="p-8 text-center text-gray-400">No attendance records available</div>
              )}
            </div>
          </div>
        )
      }

      {
        activeTab === 'notices' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Notice Board</h2>
            <div className="space-y-4">
              {notices.map((notice: any) => (
                <div key={notice.id} className="card p-6 border-l-4 border-blue-500">
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
        )
      }

      {
        activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Submit a Complaint</h2>
              <Button
                onClick={() => setIsComplaintModalOpen(true)}
                className="bg-white text-black hover:bg-gray-200"
              >
                New Complaint
              </Button>
            </div>

            <div className="card p-6 bg-yellow-900 bg-opacity-20 border-yellow-600">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📢 Anonymous Submission</h3>
              <p className="text-gray-300">
                Your complaints will be submitted anonymously. The headmaster will not be able to see your identity,
                ensuring you can report issues freely without any concerns.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Have a concern?</h3>
              <p className="text-gray-400 mb-6">
                Submit your complaints anonymously. We take all feedback seriously and work to resolve issues
                promptly.
              </p>
              <Button
                onClick={() => setIsComplaintModalOpen(true)}
                className="bg-white text-black hover:bg-gray-200"
              >
                Submit Complaint
              </Button>
            </div>
          </div>
        )
      }

      {/* Complaint Modal */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="Submit Anonymous Complaint"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <div className="card p-4 bg-yellow-900 bg-opacity-20 border-yellow-600">
            <p className="text-sm text-gray-300">
              🔒 This complaint will be submitted anonymously. Your identity will not be shared with the
              headmaster.
            </p>
          </div>

          <div>
            <label htmlFor="complaint-title" className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <Input
              id="complaint-title"
              name="title"
              value={complaintData.title}
              onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
              placeholder="Brief title for your complaint"
              required
              className="bg-white bg-opacity-10 text-white"
            />
          </div>

          <div>
            <label htmlFor="complaint-description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              id="complaint-description"
              name="description"
              value={complaintData.description}
              onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
              placeholder="Describe your complaint in detail..."
              required
              rows={6}
              className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600 focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              onClick={() => setIsComplaintModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createComplaintMutation.isPending}
              className="bg-white text-black hover:bg-gray-200"
            >
              {createComplaintMutation.isPending ? 'Submitting...' : 'Submit Anonymously'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout >
  );
}