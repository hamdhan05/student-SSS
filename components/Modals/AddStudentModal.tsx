import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
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
        admissionNumber: '',
        emisNumber: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        gender: 'Male',
        photo: '',
    });

    const createStudentMutation = useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            alert('Student added successfully!');
            onClose();
            // Reset form
            setFormData({
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
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createStudentMutation.mutate({
            ...formData,
            photo: formData.photo || '/images/students/default.jpg',
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
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
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Student">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">👤</span>
                        Personal Information
                    </h3>

                    {/* Photo Upload */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 border-4 border-white dark:border-gray-600 shadow-lg relative group">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
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
                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Upload Photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Roll Number <span className="text-red-500">*</span></label>
                            <Input
                                name="rollNumber"
                                value={formData.rollNumber}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Admission Number <span className="text-red-500">*</span></label>
                            <Input
                                name="admissionNumber"
                                value={formData.admissionNumber}
                                onChange={handleChange}
                                required
                                placeholder="IMS-XXXX"
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">EMIS Number</label>
                            <Input
                                name="emisNumber"
                                value={formData.emisNumber}
                                onChange={handleChange}
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="Male" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Male</option>
                                <option value="Female" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Female</option>
                                <option value="Other" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                            <Input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Email</label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Phone <span className="text-red-500">*</span></label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Class <span className="text-red-500">*</span></label>
                            <Input
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 10"
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Section <span className="text-red-500">*</span></label>
                            <Input
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                required
                                placeholder="e.g. A"
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Parent Information */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">👨‍👩‍👧</span>
                        Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Parent Name <span className="text-red-500">*</span></label>
                            <Input
                                name="parentName"
                                value={formData.parentName}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Parent Phone <span className="text-red-500">*</span></label>
                            <Input
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Parent Email</label>
                            <Input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleChange}
                                className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
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
                        disabled={createStudentMutation.isPending}
                        className="!bg-gray-900 !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-200"
                    >
                        {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
