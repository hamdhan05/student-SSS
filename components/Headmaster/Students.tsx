import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudents, getClasses, getSections } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import StudentDetailModal from '@/components/Modals/StudentDetailModal';
import StudentEditModal from '@/components/Modals/StudentEditModal';
import AddStudentModal from '@/components/Modals/AddStudentModal';

export default function Students() {
  const [page, setPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
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
        limit: 20,
        q: searchQuery || undefined,
      }),
  });

  const handleClearFilters = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h2>
        <Button
          className="!bg-gray-900 !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-200"
          onClick={() => setIsAddStudentModalOpen(true)}
        >
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 space-y-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Search</label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or roll..."
              className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
              style={{ colorScheme: 'light dark' }}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Section</label>
            <select
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(e.target.value || null)}
              style={{ colorScheme: 'light dark' }}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleClearFilters}
              variant="secondary"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading students...</div>
      ) : !selectedClass ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 text-2xl">
            🎓
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a Class</h3>
          <p>Please select a class from the filters above to view the student list.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Section</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Guardian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentsData?.data.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.section}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.guardianName || student.parentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.guardianPhone || student.parentPhone}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => setViewStudentId(student.id)}
                        className="px-3 py-1 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white dark:text-black mr-3 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditStudentId(student.id)}
                        className="px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm mt-4">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, studentsData?.total || 0)} of{' '}
              {studentsData?.total} students
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (studentsData?.totalPages || 1)}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

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