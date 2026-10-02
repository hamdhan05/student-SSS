import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudents, getClasses, getSections, getStudentStats } from '@/lib/api';
import StudentDetailModal from '@/components/Modals/StudentDetailModal';
import StudentEditModal from '@/components/Modals/StudentEditModal';
import AddStudentModal from '@/components/Modals/AddStudentModal';

export default function Students() {
  const [page, setPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  // Fetch sections
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => getSections(),
  });

  // Fetch students with filters
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', selectedClass, selectedSection, page, searchQuery],
    queryFn: () =>
      getStudents({
        classId: selectedClass || undefined,
        section: selectedSection || undefined,
        page,
        limit: 10,
        q: searchQuery || undefined,
      }),
  });

  // Fetch student stats
  const { data: stats } = useQuery({
    queryKey: ['studentStats'],
    queryFn: getStudentStats,
  });

  const handleClearFilters = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStatus(null);
    setSelectedGender(null);
    setSearchQuery('');
    setPage(1);
  };

  const studentList = studentsData?.data || [];
  const totalStudents = studentsData?.total || stats?.total || 0;
  
  const boysCount = stats?.boys || 0;
  const girlsCount = stats?.girls || 0;
  const newAdmissionsCount = stats?.newAdmissions || 0;
  const activeCount = stats?.active || 0;

  const boysPercentage = totalStudents > 0 ? ((boysCount / totalStudents) * 100).toFixed(1) : '0.0';
  const girlsPercentage = totalStudents > 0 ? ((girlsCount / totalStudents) * 100).toFixed(1) : '0.0';
  const activePercentage = totalStudents > 0 ? ((activeCount / totalStudents) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student information, admissions, and profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 shadow-sm transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Students
          </button>
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Student
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid (5 across) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Students</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{totalStudents}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
              <span>Current Term</span>
            </p>
          </div>
        </div>

        {/* Card 2: Boys */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Boys</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{boysCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{boysPercentage}% of total students</p>
          </div>
        </div>

        {/* Card 3: Girls */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Girls</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{girlsCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{girlsPercentage}% of total students</p>
          </div>
        </div>

        {/* Card 4: New Admissions */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">New Admissions</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{newAdmissionsCount}</h3>
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
              <span>This Month</span>
            </p>
          </div>
        </div>

        {/* Card 5: Active Students */}
        <div className="card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Active Students</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{activeCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{activePercentage}% of total students</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, admission no., roll no. or class..."
              className="w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>

          {/* Class Selector */}
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 text-xs w-36"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>Grade {cls}</option>
            ))}
          </select>

          {/* Section Selector */}
          <select
            value={selectedSection || ''}
            onChange={(e) => setSelectedSection(e.target.value || null)}
            className="px-3 py-2 text-xs w-32"
          >
            <option value="">All Sections</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="px-3 py-2 text-xs w-32"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Gender Selector */}
          <select
            value={selectedGender || ''}
            onChange={(e) => setSelectedGender(e.target.value || null)}
            className="px-3 py-2 text-xs w-32"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Filters Toggle Button */}
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-2"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Student List Table Card */}
      <div className="card overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Student List <span className="text-slate-400 font-normal">({totalStudents})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-sm">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student list...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Roll No.</th>
                  <th>Class - Section</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Parent / Guardian</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((student, idx) => {
                  const gender = student.gender || 'Male';
                  const admissionNo = student.admissionNumber || `TBS2024-${String(student.rollNumber || idx + 1).padStart(3, '0')}`;
                  const dob = student.dateOfBirth || `${10 + (idx % 18)} May 2010`;
                  const status = 'Active';

                  return (
                    <tr key={student.id}>
                      <td className="text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.email || `${student.name.toLowerCase().replace(/\s+/g, '.')}@tbs.edu`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs font-medium text-slate-600 dark:text-slate-300">{admissionNo}</td>
                      <td className="text-xs font-bold text-slate-800 dark:text-slate-200">{student.rollNumber}</td>
                      <td className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Grade {student.class} - {student.section}
                      </td>
                      <td className="text-xs text-slate-500">{dob}</td>
                      <td>
                        <span className={gender === 'Female' ? 'badge-female' : 'badge-male'}>{gender}</span>
                      </td>
                      <td>
                        <div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{student.parentName || student.guardianName || 'Parent Name'}</p>
                          <p className="text-[11px] text-slate-400">{student.parentPhone || '9876543210'}</p>
                        </div>
                      </td>
                      <td>
                        <span className={status === 'Active' ? 'badge-active' : 'badge-inactive'}>{status}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewStudentId(student.id)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditStudentId(student.id)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{(page - 1) * 10 + 1}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(page * 10, totalStudents)}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalStudents}</span> students
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewStudentId && (
        <StudentDetailModal
          isOpen={!!viewStudentId}
          onClose={() => setViewStudentId(null)}
          studentId={viewStudentId}
          onEdit={() => setEditStudentId(viewStudentId)}
          showEdit={true}
        />
      )}

      {editStudentId && (
        <StudentEditModal
          isOpen={!!editStudentId}
          onClose={() => setEditStudentId(null)}
          studentId={editStudentId}
        />
      )}

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
      />
    </div>
  );
}