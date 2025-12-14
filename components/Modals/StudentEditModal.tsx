import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentById, updateStudent } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export default function StudentEditModal({ isOpen, onClose, studentId }: StudentEditModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    class: '',
    section: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
  });

  useEffect(() => {
    if (isOpen && studentId) {
      getStudentById(studentId).then((student) => {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth || '',
          address: student.address || '',
          class: student.class?.toString() || '',
          section: student.section || '',
          rollNumber: student.rollNumber || '',
          guardianName: student.guardianName || student.parentName || '',
          guardianPhone: student.guardianPhone || student.parentPhone || '',
        });
      });
    }
  }, [isOpen, studentId]);

  const updateStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const studentData = {
        ...data,
        parentName: data.guardianName, // Map back to API format
        parentPhone: data.guardianPhone,
      };
      return updateStudent(studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      alert('Student updated successfully!');
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentMutation.mutate({ ...formData, id: studentId });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Details">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-500 bg-opacity-20 rounded-lg text-blue-400">👤</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
              <Input
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
              <Input
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
              <Input
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>


        {/* Parent/Guardian Information */}
        <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 bg-green-500 bg-opacity-20 rounded-lg text-green-400">👨‍👩‍👧</span>
            Parent/Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Guardian Name</label>
              <Input
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Guardian Phone</label>
              <Input
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                required
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateStudentMutation.isPending}
            className="bg-white text-black hover:bg-gray-200"
          >
            {updateStudentMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal >
  );
}
