import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeachers } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
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
      (teacher.subject && teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher.domain && teacher.domain.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Teachers</h2>
        <Button
          className="!bg-gray-900 !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-200"
          onClick={() => setIsAddTeacherModalOpen(true)}
        >
          Add Teacher
        </Button>
      </div>

      {/* Search */}
      <div className="card p-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teachers by name, email, or subject..."
          className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        />
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading teachers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-white transition-colors rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-white/20 dark:text-white flex items-center justify-center text-2xl font-bold overflow-hidden border border-gray-200 dark:border-gray-600">
                  {teacher.photo && teacher.photo !== '/images/teachers/default.jpg' ? (
                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    teacher.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                  <p className="text-sm text-gray-400">{teacher.subject || teacher.domain}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="text-gray-400">Email:</span> {teacher.email}
                </p>
                <p>
                  <span className="text-gray-400">Phone:</span> {teacher.phone}
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">Classes:</span> {teacher.classes?.join(', ') || 'Not assigned'}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setViewTeacherId(teacher.id)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 dark:bg-white dark:text-black text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setViewTeacherId(teacher.id);
                    setIsEditTeacherModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTeachers.length === 0 && !isLoading && (
        <div className="card p-8 text-center text-gray-400">
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