import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeachers } from '@/lib/api';
import { maskPhoneNumber } from '@/lib/utils';
import AddTeacherModal from '@/components/Modals/AddTeacherModal';
import TeacherDetailModal from '@/components/Modals/TeacherDetailModal';
import TeacherEditModal from '@/components/Modals/TeacherEditModal';

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [viewTeacherId, setViewTeacherId] = useState<string | null>(null);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
  });

  const filteredTeachers = teachers.filter((teacher) =>
    searchQuery
      ? teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Teachers Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage teacher profiles, subject assignments, and academic qualifications.
          </p>
        </div>
        <button
          onClick={() => setIsAddTeacherModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teachers by name, email, or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select className="px-3 py-2 text-xs w-40">
          <option value="">All Departments</option>
          <option value="Sciences">Sciences</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Languages">Languages</option>
        </select>
      </div>

      {/* Teachers Cards Grid */}
      {isLoading ? (
        <div className="card p-12 text-center text-xs text-slate-400">Loading teachers directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="card p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center text-lg font-bold flex-shrink-0 border border-blue-100">
                  {teacher.photo && teacher.photo !== '/images/teachers/default.jpg' ? (
                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    teacher.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{teacher.name}</h3>
                  <span className="inline-block mt-1 badge-male">{teacher.subject || teacher.domain || 'General Teacher'}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium truncate max-w-[170px]">{teacher.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-medium">{maskPhoneNumber(teacher.phone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Classes:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.classes?.join(', ') || 'None'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setViewTeacherId(teacher.id)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold dark:bg-slate-800 dark:text-slate-200 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setViewTeacherId(teacher.id);
                    setIsEditTeacherModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTeachers.length === 0 && !isLoading && (
        <div className="card p-12 text-center text-xs text-slate-400">
          No teachers found matching your search.
        </div>
      )}

      <AddTeacherModal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
      />

      {viewTeacherId && (
        <>
          <TeacherDetailModal
            isOpen={!!viewTeacherId && !isEditTeacherModalOpen}
            onClose={() => setViewTeacherId(null)}
            teacherId={viewTeacherId}
          />
          <TeacherEditModal
            isOpen={isEditTeacherModalOpen}
            onClose={() => {
              setIsEditTeacherModalOpen(false);
              setViewTeacherId(null);
            }}
            teacherId={viewTeacherId}
          />
        </>
      )}
    </div>
  );
}