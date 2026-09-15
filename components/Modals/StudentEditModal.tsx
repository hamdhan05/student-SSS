import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStudentById, updateStudent } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { sanitizeInput } from '@/lib/security';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  emisNumber: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  gender: string;
  photo: string;
  guardianName: string;
  guardianPhone: string;
}

export default function StudentEditModal({ isOpen, onClose, studentId }: StudentEditModalProps) {
  const queryClient = useQueryClient();

  const { data: student, isLoading, isError, error } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: isOpen && !!studentId,
    retry: 1,
  });

  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    class: '',
    section: '',
    rollNumber: '',
    admissionNumber: '',
    emisNumber: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gender: 'Male',
    photo: '',
    guardianName: '',
    guardianPhone: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state when data is loaded
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth || '',
        address: student.address || '',
        class: student.class?.toString() || '',
        section: student.section || '',
        rollNumber: student.rollNumber || '',
        admissionNumber: student.admissionNumber || '',
        emisNumber: student.emisNumber || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        gender: student.gender || 'Male',
        photo: student.photo || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
      });
    }
  }, [student]);

  const updateStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const studentData = {
        ...data,
        id: studentId,
        admissionDate: student?.admissionDate || '2020-01-01', // Preserve or default
      };
      return updateStudent(studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      setSuccessMessage('Student updated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update student. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    updateStudentMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Details">
      {isError && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold">Error loading data</p>
          <p>{(error as Error)?.message || 'Could not fetch student details.'}</p>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {formError}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {successMessage}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">👤</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Roll Number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="Admission Number"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleChange}
              />
              <Input
                label="EMIS Number"
                name="emisNumber"
                value={formData.emisNumber}
                onChange={handleChange}
              />
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <Input
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Input
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
              />
              <Input
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                />
              </div>
            </div>
          </div>


          {/* Parent/Guardian Information */}
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">👨‍👩‍👧</span>
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Parent Name"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
              />
              <Input
                label="Parent Phone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                required
              />
              <Input
                label="Parent Email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
              />
              <Input
                label="Guardian Name"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
              />
              <Input
                label="Guardian Phone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={updateStudentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal >
  );
}
