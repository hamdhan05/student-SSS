import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  const subTabs = ['Overview', 'Classes', 'Subjects', 'Curriculum', 'Timetable', 'Assignments', 'Grade Book'];

  const classList = [
    { class: 'Grade 6', section: 'A', students: 28, teacher: 'Mr. John D.', room: '101', status: 'Active' },
    { class: 'Grade 7', section: 'B', students: 32, teacher: 'Ms. Priya S.', room: '102', status: 'Active' },
    { class: 'Grade 8', section: 'A', students: 30, teacher: 'Mr. Michael R.', room: '201', status: 'Active' },
    { class: 'Grade 9', section: 'A', students: 29, teacher: 'Ms. Ananya K.', room: '202', status: 'Active' },
    { class: 'Grade 10', section: 'B', students: 31, teacher: 'Mr. David L.', room: '203', status: 'Active' },
  ];

  const upcomingClasses = [
    { time: '08:00 AM - 08:45 AM', title: 'Grade 8 - A Mathematics', teacher: 'Mr. Michael R.', room: '201' },
    { time: '09:00 AM - 09:45 AM', title: 'Grade 7 - B Science', teacher: 'Ms. Priya S.', room: '102' },
    { time: '10:00 AM - 10:45 AM', title: 'Grade 9 - A English', teacher: 'Ms. Ananya K.', room: '202' },
    { time: '11:00 AM - 11:45 AM', title: 'Grade 6 - A Social Studies', teacher: 'Mr. John D.', room: '101' },
  ];

  const recentActivities = [
    { title: 'New assignment added in Grade 8 - A (Mathematics)', author: 'By Mr. Michael R.', time: '30 mins ago' },
    { title: 'Timetable updated for Grade 7 - B', author: 'By Ms. Priya S.', time: '2 hours ago' },
    { title: 'New subject "AI Fundamentals" added for Grade 9', author: 'By Super Admin', time: '5 hours ago' },
    { title: 'Grade 10 - B exam schedule published', author: 'By Examinations Office', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage classes, subjects, curriculum, timetables and academic activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 shadow-sm">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Academic Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="card p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 5 KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Classes</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">48</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 4 from last month</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Subjects</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">156</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 6 from last month</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Teachers</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">96</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 3 from last month</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Active Timetables</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">42</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 5 from last month</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Completion Rate</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">92.6%</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 2.3% from last month</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tables/Charts & Right Side Activity Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Overview Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Class Overview</h3>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Students</th>
                    <th>Class Teacher</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classList.map((c, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-slate-900 dark:text-white">{c.class}</td>
                      <td>{c.section}</td>
                      <td className="font-bold text-slate-700 dark:text-slate-300">{c.students}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {c.teacher.charAt(4)}
                          </div>
                          <span className="text-xs font-medium">{c.teacher}</span>
                        </div>
                      </td>
                      <td>{c.room}</td>
                      <td>
                        <span className="badge-active">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Subject Distribution</h3>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Donut Chart representation */}
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-full border-[14px] border-blue-500 border-t-pink-500 border-r-purple-500 border-b-amber-400"></div>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">156</span>
                  <span className="text-[10px] text-slate-400">Subjects</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 flex-1 w-full text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Mathematics</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">24 <span className="font-normal text-slate-400">(15.4%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Science</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">22 <span className="font-normal text-slate-400">(14.1%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> English</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">20 <span className="font-normal text-slate-400">(12.8%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Social Studies</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">18 <span className="font-normal text-slate-400">(11.5%)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Upcoming Classes Today */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Upcoming Classes Today</h3>
              <button className="text-xs font-semibold text-blue-600">View Timetable</button>
            </div>
            <div className="space-y-3">
              {upcomingClasses.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="px-2.5 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded-lg text-[10px] font-bold text-center leading-tight flex-shrink-0">
                    {item.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.teacher}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                    {item.room}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Academic Activities */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Academic Activities</h3>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>
            <div className="space-y-3.5">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{act.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400">{act.author}</span>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
