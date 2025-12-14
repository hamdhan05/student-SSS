import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeacher } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface AddTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTeacherModal({ isOpen, onClose }: AddTeacherModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        domain: '',
        qualification: '',
        experience: '',
        fatherName: '',
        motherName: '',
    });

    const createTeacherMutation = useMutation({
        mutationFn: (data: typeof formData) => createTeacher({
            ...data,
            photo: '/images/teachers/default.jpg'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            alert('Teacher added successfully!');
            onClose();
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                address: '',
                domain: '',
                qualification: '',
                experience: '',
                fatherName: '',
                motherName: '',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTeacherMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Teacher">
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Subject/Domain</label>
                            <Input
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Mathematics"
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

                {/* Professional & Family Information */}
                <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-purple-500 bg-opacity-20 rounded-lg text-purple-400">🎓</span>
                        Professional & Family
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Qualification</label>
                            <Input
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                required
                                className="bg-white bg-opacity-10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
                            <Input
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 5 years"
                                className="bg-white bg-opacity-10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Father Name</label>
                            <Input
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                required
                                className="bg-white bg-opacity-10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mother Name</label>
                            <Input
                                name="motherName"
                                value={formData.motherName}
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
                        disabled={createTeacherMutation.isPending}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {createTeacherMutation.isPending ? 'Adding...' : 'Add Teacher'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
