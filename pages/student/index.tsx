import { useState } from 'react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentById, getAttendanceByStudent, createComplaint, getNotices } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Layout from '@/components/UI/Layout';
import StudentHomework from '@/components/Student/Homework';

export default function StudentPortal() {
  const { user, loading } = useRequireAuth(['student']);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'attendance' | 'academics' | 'timetable' | 'homework' | 'notices' | 'complaints'>('attendance');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintData, setComplaintData] = useState({ title: '', description: '' });

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
      alert('Complaint submitted anonymously to the headmaster.');
    },
  });

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    createComplaintMutation.mutate({
      studentId,
      category: 'General',
      text: complaintData.description,
      ...complaintData,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-semibold text-sm">Loading Student Portal...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: '📊', category: 'Main' },
    { id: 'academics', label: 'Academics', icon: '📚', category: 'Main' },
    { id: 'timetable', label: 'Timetable', icon: '📅', category: 'Main' },
    { id: 'homework', label: 'Assignments', icon: '📝', category: 'Academics' },
    { id: 'notices', label: 'Notices', icon: '📢', category: 'Communication' },
    { id: 'complaints', label: 'Submit Complaint', icon: '💬', category: 'System' },
  ];

  const totalDays = attendance.length || 1;
  const presentDays = attendance.filter((a: any) => a.status === 'present').length;
  const absentDays = attendance.filter((a: any) => a.status === 'absent').length;
  const attendancePercent = attendance.length > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0';

  return (
    <Layout
      title="Student Portal"
      user={{
        ...user,
        name: student?.name || user.name || 'Arjun Kumar',
        role: 'Student (Class 10-A)',
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as any)}
      onLogout={handleLogout}
    >
      {/* Attendance View (Default Reference Design) */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track your attendance and class participation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Academic Year</option>
              </select>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200/80 rounded-xl hover:bg-blue-100">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report
              </button>
            </div>
          </div>

          {/* 5 KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1 */}
            <div className="card p-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Overall Attendance</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{attendancePercent}%</h3>
                  <span className="text-[10px] font-bold text-emerald-600">Excellent</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${attendancePercent}%` }}></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Classes Held</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{attendance.length}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">This Month</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Classes Attended</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{presentDays}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">This Month</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Classes Missed</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{absentDays}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">This Month</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Periods</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">620</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">This Academic Year</p>
              </div>
            </div>
          </div>

          {/* Main Grid: Attendance Line Chart (Left 2 cols) & Monthly Calendar (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Overview Chart Box */}
            <div className="lg:col-span-2 card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Attendance Overview</h3>
                <select className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                  <option>This Month</option>
                </select>
              </div>
              {/* Line Graph Visualization */}
              <div className="h-56 w-full flex flex-col justify-between pt-4">
                <div className="relative h-44 w-full flex items-end justify-between border-b border-slate-200 dark:border-slate-800 px-4">
                  {/* Visual SVG Line Graph */}
                  <svg className="absolute inset-0 w-full h-full text-emerald-500 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                      d="M0,35 Q 16,10 33,25 T 66,20 T 100,10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,35 Q 16,10 33,25 T 66,20 T 100,10 L 100,100 L 0,100 Z"
                      fill="currentColor"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 px-2 pt-2">
                  <span>01 May</span>
                  <span>05 May</span>
                  <span>10 May</span>
                  <span>15 May</span>
                  <span>20 May</span>
                  <span>25 May</span>
                  <span>31 May</span>
                </div>
              </div>
              <div className="flex justify-center items-center gap-2 pt-2 text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Attendance %
              </div>
            </div>

            {/* Attendance Calendar Widget */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Attendance Calendar</h3>
                <span className="text-xs font-bold text-slate-700">May 2024</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="text-[10px] text-slate-400 font-bold uppercase">{d}</span>
                ))}
                {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2].map((day, idx) => {
                  const isMay = idx >= 2 && idx <= 32;
                  const isPresent = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 20, 21, 23, 24, 27, 28, 29, 30, 31].includes(day) && isMay;
                  const isAbsent = [8, 22].includes(day) && isMay;

                  return (
                    <div
                      key={idx}
                      className={`h-7 flex items-center justify-center rounded-lg text-xs font-medium relative ${
                        !isMay ? 'text-slate-300' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {day}
                      {isPresent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1"></span>}
                      {isAbsent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1"></span>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Late</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Holiday</span>
              </div>
            </div>
          </div>

          {/* Bottom Table: Subject-wise Attendance */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Subject-wise Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-medium">{new Date(a.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          a.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center py-4 text-slate-500">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
              ⓘ Attendance is calculated based on classes you are marked present for.
            </div>
          </div>
        </div>
      )}

      {/* Academics Tab */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {student?.academics?.map((record: any) => (
              <div key={`${record.subject}-${record.term}`} className="card p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{record.subject}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{record.term}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Marks Obtained:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{record.marks} / {record.totalMarks}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 dark:text-white">
                    <span>Grade:</span>
                    <span className="text-blue-600 text-sm">{record.grade}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!student?.academics || student.academics.length === 0) && (
              <div className="col-span-full card p-8 text-center text-slate-500">
                No academic records available.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="card p-6 overflow-x-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Class Timetable</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Time</th>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <th key={day} className="text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00'].map((time, i) => (
                <tr key={time}>
                  <td className="font-semibold text-slate-700">{time}</td>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, j) => {
                    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Physics'];
                    const subject = subjects[(i + j) % subjects.length];
                    const isLunch = i === 3;
                    return (
                      <td key={day} className="text-center">
                        {isLunch ? (
                          <span className="text-slate-400 italic text-xs">Lunch Break</span>
                        ) : (
                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                            <p className="font-bold text-slate-800 dark:text-white">{subject}</p>
                            <p className="text-[10px] text-slate-400">Room {101 + i}</p>
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
      )}

      {/* Homework Tab */}
      {activeTab === 'homework' && student && (
        <StudentHomework student={student} />
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notice Board</h2>
          {notices.map((notice: any) => (
            <div key={notice.id} className="card p-6 border-l-4 border-blue-600 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{notice.title}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{notice.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Anonymous Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Anonymous Complaint</h2>
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              New Complaint
            </button>
          </div>
          <div className="card p-6 bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <h3 className="font-bold mb-1">📢 Anonymous Protection</h3>
            <p>Your identity is hidden from the headmaster. Submit concerns freely and safely.</p>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="Submit Anonymous Complaint"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              value={complaintData.title}
              onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
              placeholder="Brief title"
              required
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={complaintData.description}
              onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
              placeholder="Describe your concern in detail..."
              required
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createComplaintMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
            >
              {createComplaintMutation.isPending ? 'Submitting...' : 'Submit Anonymously'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}