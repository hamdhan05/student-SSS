import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { sanitizeInput } from '@/lib/security';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
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

const INITIAL_DATA: StudentFormData = {
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
    gender: 'Male', // Default
    photo: '',
    guardianName: '',
    guardianPhone: '',
};

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<StudentFormData>(INITIAL_DATA);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const addStudentMutation = useMutation({
        mutationFn: async (data: StudentFormData) => {
            // Map form data to API structure
            const studentData = {
                ...data,
                // Ensure required fields for API are present
                // guardianName is optional in Student, parentName is required
                // We map form fields 1:1 since we restored them
                photo: data.photo || '/images/students/default.jpg',
            };
            return createStudent(studentData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setSuccessMessage('Student added successfully!');

            // Reset form and close after a short delay
            setTimeout(() => {
                setFormData(INITIAL_DATA);
                setSuccessMessage(null);
                onClose();
            }, 1500);
        },
        onError: (err: any) => {
            setFormError(err.message || 'Failed to add student. Please check the inputs.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        addStudentMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Student" size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Messages */}
                {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fadeIn">
                        {formError}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm animate-fadeIn">
                        {successMessage}
                    </div>
                )}

                {/* Personal Information */}
                {/* Personal Information */}
                <div className="bg-white dark:bg-white dark:bg-opacity-5 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-500 dark:bg-opacity-20 rounded-lg dark:text-blue-400">👤</span>
                        Personal Information
                    </h3>

                    {/* Photo Upload */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4 border-4 border-gray-600 shadow-lg relative group">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">👤</div>
                            )}
                            <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">Change</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                            placeholder="Ex: John Doe"
                        />
                        <Input
                            label="Roll Number"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Admission Number"
                            name="admissionNumber"
                            value={formData.admissionNumber}
                            onChange={handleChange}
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="EMIS Number"
                            name="emisNumber"
                            value={formData.emisNumber}
                            onChange={handleChange}
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            type="date"
                            label="Date of Birth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Class"
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                            maxLength={2}
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="bg-white dark:bg-white dark:bg-opacity-5 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-green-100 text-green-600 dark:bg-green-500 dark:bg-opacity-20 rounded-lg dark:text-green-400">👨‍👩‍👧</span>
                        Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Parent Name"
                            name="parentName"
                            value={formData.parentName}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Parent Phone"
                            name="parentPhone"
                            value={formData.parentPhone}
                            onChange={handleChange}
                            required
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                        <Input
                            label="Parent Email"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleChange}
                            className="bg-white text-gray-900 border-gray-300 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        disabled={addStudentMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={addStudentMutation.isPending}
                        className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {addStudentMutation.isPending ? 'Adding Student...' : 'Add Student'}
                    </Button>
                </div>
            </form>
        </Modal >
    );
}
