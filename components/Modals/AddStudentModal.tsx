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
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        gender: 'Male',
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
                parentName: '',
                parentPhone: '',
                parentEmail: '',
                gender: 'Male',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createStudentMutation.mutate({
            ...formData,
            photo: '/images/students/default.jpg',
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Student">
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            >
                                <option value="Male" className="bg-gray-900">Male</option>
                                <option value="Female" className="bg-gray-900">Female</option>
                                <option value="Other" className="bg-gray-900">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                            <Input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                            <Input
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 10"
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
                                placeholder="e.g. A"
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

                {/* Parent Information */}
                <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-green-500 bg-opacity-20 rounded-lg text-green-400">👨‍👩‍👧</span>
                        Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Parent Name</label>
                            <Input
                                name="parentName"
                                value={formData.parentName}
                                onChange={handleChange}
                                required
                                className="bg-white bg-opacity-10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Parent Phone</label>
                            <Input
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                required
                                className="bg-white bg-opacity-10 text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Parent Email</label>
                            <Input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleChange}
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
                        disabled={createStudentMutation.isPending}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
