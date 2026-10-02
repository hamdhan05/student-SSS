import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/UI/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClasses, getStudents, markAttendanceBatch, getTeacherById, getNotices, getAttendanceByClassAndDate } from '@/lib/api';
import StudentDetailModal from '@/components/Modals/StudentDetailModal';
import TeacherHomework from '@/components/Teacher/Homework';
import TeacherMarks from '@/components/Teacher/Marks';

export default function TeacherPortal() {
  const { user, loading } = useRequireAuth(['teacher']);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'present' | 'absent'>>({});
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);

  // Filter states for tasks
  const [taskFilter, setTaskFilter] = useState('All');
  const [taskSearch, setTaskSearch] = useState('');

  const { data: teacher } = useQuery({
    queryKey: ['teacher', user?.id],
    queryFn: () => getTeacherById(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: notices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const assignedClasses = teacher?.classes || ['10A', '9B'];

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  const availableClasses = classes.filter((cls: any) =>
    assignedClasses.some((ac: string) => ac.startsWith(String(cls)))
  );

  const availableSections = assignedClasses
    .filter((ac: string) => ac.startsWith(String(selectedClass)))
    .map((ac: string) => ac.replace(String(selectedClass), ''));

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

  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance', selectedClass, selectedSection, selectedDate],
    queryFn: () => getAttendanceByClassAndDate(String(selectedClass), selectedSection, selectedDate),
    enabled: !!selectedClass && !!selectedSection && !!selectedDate,
  });

  useEffect(() => {
    if (existingAttendance && studentsData?.data) {
      const initialMarks: Record<string, 'present' | 'absent'> = {};
      studentsData.data.forEach((s: any) => {
        initialMarks[s.id] = 'present';
      });
      existingAttendance.forEach((r: any) => {
        if (r.status === 'absent') {
          initialMarks[r.studentId] = 'absent';
        }
      });
      setAttendanceMarks(initialMarks);
    }
  }, [existingAttendance, studentsData]);

  const markAttendanceMutation = useMutation({
    mutationFn: markAttendanceBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      alert('Attendance marked successfully!');
      setAttendanceMarks({});
    },
  });

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

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-semibold">Loading Faculty Portal...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'tasks', label: 'My Tasks', icon: '📋', category: 'Main' },
    { id: 'attendance', label: 'Attendance', icon: '📝', category: 'Main' },
    { id: 'timetable', label: 'Timetable', icon: '📅', category: 'Main' },
    { id: 'homework', label: 'Assignments', icon: '📚', category: 'Academics' },
    { id: 'marks', label: 'Marks & Results', icon: '📊', category: 'Academics' },
    { id: 'notices', label: 'Notices', icon: '📢', category: 'Communication' },
  ];

  const mockTasks = [
    { id: 1, task: 'Review Lab Reports', desc: 'Review and grade Physics lab reports submitted by students.', category: 'Grading', priority: 'High', dueDate: '28 May 2024, 11:59 PM', status: 'Overdue' },
    { id: 2, task: 'Prepare Lesson Plan', desc: 'Prepare lesson plan for Chapter 5 - Acids, Bases and Salts.', category: 'Teaching', priority: 'Medium', dueDate: '30 May 2024, 10:00 AM', status: 'Pending' },
    { id: 3, task: 'Parent Meeting', desc: 'Monthly parent-teacher meeting for Class 10 - A.', category: 'Meeting', priority: 'Medium', dueDate: '31 May 2024, 03:00 PM', status: 'Pending' },
    { id: 4, task: 'Create Quiz', desc: 'Create online quiz for periodic table topic.', category: 'Assessment', priority: 'High', dueDate: '01 Jun 2024, 11:59 PM', status: 'Pending' },
    { id: 5, task: 'Upload Study Material', desc: 'Upload notes for Electrochemistry chapter.', category: 'Teaching', priority: 'Low', dueDate: '03 Jun 2024, 09:00 AM', status: 'Pending' },
    { id: 6, task: 'Analyze Test Results', desc: 'Analyze and review Unit Test - 1 results.', category: 'Grading', priority: 'Medium', dueDate: '05 Jun 2024, 05:00 PM', status: 'Pending' },
  ];

  const upcomingDeadlines = [
    { title: 'Prepare Lesson Plan', date: '30 May 2024, 10:00 AM', pill: 'In 1 Day' },
    { title: 'Parent Meeting', date: '31 May 2024, 03:00 PM', pill: 'In 2 Days' },
    { title: 'Create Quiz', date: '01 Jun 2024, 11:59 PM', pill: 'In 3 Days' },
    { title: 'Upload Study Material', date: '03 Jun 2024, 09:00 AM', pill: 'In 5 Days' },
  ];

  const recentCompleted = [
    { title: 'Class Test Grading', date: '24 May 2024' },
    { title: 'Lecture Notes Upload', date: '22 May 2024' },
    { title: 'Student Attendance Review', date: '20 May 2024' },
    { title: 'Answer Key Review', date: '18 May 2024' },
  ];

  return (
    <Layout
      title="Faculty Portal"
      user={{
        ...user,
        name: user.name || 'Ms. Priya Sharma',
        role: 'Faculty Teacher',
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      extraSidebarContent={
        <div className="card p-3 bg-blue-50/70 border-blue-100 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200">
          <p className="font-bold mb-1">Need Help?</p>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 mb-2">We're here to help you</p>
          <button className="w-full py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-[11px] hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      }
    >
      {/* Tab 1: My Tasks (Faculty Main Dashboard) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organize and manage your tasks efficiently.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Task
            </button>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Tasks</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">28</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">All Tasks</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Completed</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">16</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">57.1% Completed</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Pending</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">8</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">28.6% Pending</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Overdue</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">4</h3>
                <p className="text-[11px] text-rose-600 font-semibold mt-0.5">14.3% Overdue</p>
              </div>
            </div>
          </div>

          {/* Main Grid: Task Table Left (2 Cols) + Side Panel Widgets Right (1 Col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Task List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter Toolbar & Sub-tabs */}
              <div className="card p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <select className="px-3 py-1.5 text-xs w-36">
                    <option value="">All Categories</option>
                    <option value="Grading">Grading</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                  <select className="px-3 py-1.5 text-xs w-32">
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select className="px-3 py-1.5 text-xs w-32">
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="relative flex-1 min-w-[160px]">
                    <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Sub Tab Pills */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pt-2 text-xs font-semibold">
                  {['All Tasks', 'Pending', 'Overdue', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTaskFilter(tab)}
                      className={`pb-2 transition-colors relative ${
                        taskFilter === tab
                          ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-10 text-center">
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                        </th>
                        <th>Task</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTasks.map((t) => (
                        <tr key={t.id}>
                          <td className="text-center">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                          </td>
                          <td>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.task}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</p>
                            </div>
                          </td>
                          <td className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.category}</td>
                          <td>
                            <span className={
                              t.priority === 'High' ? 'badge-inactive' : t.priority === 'Medium' ? 'badge-pending' : 'badge-active'
                            }>
                              {t.priority}
                            </span>
                          </td>
                          <td className="text-xs text-slate-500 font-medium">{t.dueDate}</td>
                          <td>
                            <span className={t.status === 'Overdue' ? 'badge-inactive' : 'badge-pending'}>
                              {t.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button className="p-1 text-slate-400 hover:text-slate-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing 1 to 6 of 28 tasks</span>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 rounded bg-blue-600 text-white font-bold">1</button>
                    <button className="px-2 py-1 rounded border border-slate-200">2</button>
                    <button className="px-2 py-1 rounded border border-slate-200">3</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Panel Widgets */}
            <div className="space-y-6">
              {/* Mini Calendar Widget */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Calendar</h3>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">May 2024</span>
                </div>
                {/* Grid Calendar */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="text-[10px] text-slate-400 font-bold uppercase">{d}</span>
                  ))}
                  {[28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1].map((day, idx) => {
                    const isMay = idx >= 3 && idx <= 33;
                    const isSelected = day === 31 && isMay;
                    const isOverdue = day === 28 && isMay;
                    const isToday = day === 30 && isMay;

                    return (
                      <div
                        key={idx}
                        className={`h-7 flex items-center justify-center rounded-lg text-xs font-medium relative ${
                          !isMay
                            ? 'text-slate-300 dark:text-slate-700'
                            : isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {day}
                        {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1"></span>}
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1"></span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Overdue</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Due Today</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Upcoming</span>
                </div>
              </div>

              {/* Task Summary Donut Chart Widget */}
              <div className="card p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Task Summary</h3>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-full border-[10px] border-emerald-500 border-t-amber-400 border-r-rose-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">28</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
                      <span className="font-bold">16 (57.1%)</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending</span>
                      <span className="font-bold">8 (28.6%)</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Overdue</span>
                      <span className="font-bold">4 (14.3%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines Widget */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Deadlines</h3>
                  <button className="text-xs font-semibold text-blue-600">View All</button>
                </div>
                <div className="space-y-3">
                  {upcomingDeadlines.map((dl, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dl.title}</p>
                        <p className="text-[10px] text-slate-400">{dl.date}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                        {dl.pill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Completed Widget */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recently Completed</h3>
                  <button className="text-xs font-semibold text-blue-600">View All</button>
                </div>
                <div className="space-y-2.5">
                  {recentCompleted.map((rc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{rc.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rc.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Marking */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mark Attendance</h2>
                <p className="text-xs text-slate-500">Record daily class participation and attendance records.</p>
              </div>
              {assignedClasses.length > 0 && (
                <div className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200">
                  Assigned Classes: {assignedClasses.join(', ')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(Number(e.target.value));
                    setSelectedSection('');
                  }}
                  className="w-full px-3 py-2 text-xs"
                >
                  <option value={0}>Select Class</option>
                  {availableClasses.map((cls: any) => (
                    <option key={cls} value={cls}>Grade {cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs"
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {availableSections.map((sec: any) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMarkAll('present')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {studentsLoading ? (
            <div className="card p-8 text-center text-xs text-slate-400">Loading student list...</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th className="text-center">Attendance</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData?.data.map((student: any) => {
                    const status = attendanceMarks[student.id] || 'present';
                    return (
                      <tr key={student.id}>
                        <td className="font-bold text-slate-800">{student.rollNumber}</td>
                        <td className="font-semibold text-slate-900 dark:text-white">{student.name}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'present' }))}
                              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                status === 'present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'absent' }))}
                              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                status === 'absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => setViewStudentId(student.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSubmitAttendance}
                  disabled={markAttendanceMutation.isPending || Object.keys(attendanceMarks).length === 0}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {markAttendanceMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Timetable */}
      {activeTab === 'timetable' && (
        <div className="card p-6 overflow-x-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Timetable</h2>
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
                    const hasClass = (i + j) % 2 === 0;
                    return (
                      <td key={day} className="text-center">
                        {hasClass ? (
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl text-xs">
                            <p className="font-bold">Grade 10 - A</p>
                            <p className="text-[10px] text-blue-500">Room 201</p>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
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

      {/* Tab 4: Homework / Assignments */}
      {activeTab === 'homework' && (
        <TeacherHomework assignedClasses={assignedClasses} />
      )}

      {/* Tab 5: Marks & Results */}
      {activeTab === 'marks' && (
        <TeacherMarks assignedClasses={assignedClasses} />
      )}

      {/* Tab 6: Notices */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notice Board</h2>
          {notices.map((notice: any) => (
            <div key={notice.id} className="card p-6 border-l-4 border-amber-500 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{notice.title}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{notice.content}</p>
              <p className="text-[10px] text-slate-400 font-medium pt-2">Posted by: {notice.createdBy}</p>
            </div>
          ))}
        </div>
      )}

      {viewStudentId && (
        <StudentDetailModal
          isOpen={!!viewStudentId}
          onClose={() => setViewStudentId(null)}
          studentId={viewStudentId}
          showEdit={false}
        />
      )}
    </Layout>
  );
}