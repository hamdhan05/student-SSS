import { useState } from 'react';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import { maskPhoneNumber } from '@/lib/utils';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  classes: string[];
  status: 'active' | 'inactive';
}

interface TeacherGridProps {
  teachers: Teacher[];
  onTeacherClick?: (teacher: Teacher) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

export default function TeacherGrid({
  teachers,
  onTeacherClick,
  onEditTeacher,
  onDeleteTeacher,
}: TeacherGridProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    if (selectedTeacher && onDeleteTeacher) {
      onDeleteTeacher(selectedTeacher.id);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    }
  };

  const confirmDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${teacher.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {teacher.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">📧 {teacher.email}</p>
              {teacher.phone && <p className="text-sm text-gray-600">📞 {maskPhoneNumber(teacher.phone)}</p>}
              <p className="text-sm text-gray-600">
                📚 {teacher.classes.length} class{teacher.classes.length !== 1 ? 'es' : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onTeacherClick?.(teacher)}
                fullWidth
              >
                View Details
              </Button>
              {onEditTeacher && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEditTeacher(teacher)}
                >
                  Edit
                </Button>
              )}
              {onDeleteTeacher && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => confirmDelete(teacher)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No teachers found. Add teachers to get started.
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <strong>{selectedTeacher?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
