import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateTeacher, getTeacherById } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface TeacherEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
}

export default function TeacherEditModal({ isOpen, onClose, teacherId }: TeacherEditModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        id: '',
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
        classes: [] as string[],
        joiningDate: '',
        photo: '',
    });

    const [currentClass, setCurrentClass] = useState('10');
    const [currentSection, setCurrentSection] = useState('A');

    const { data: teacher, isLoading } = useQuery({
        queryKey: ['teacher', teacherId],
        queryFn: () => getTeacherById(teacherId),
        enabled: isOpen && !!teacherId,
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                dateOfBirth: teacher.dateOfBirth,
                address: teacher.address,
                domain: teacher.domain,
                qualification: teacher.qualification,
                experience: teacher.experience,
                fatherName: teacher.fatherName,
                motherName: teacher.motherName,
                classes: teacher.classes || [],
                joiningDate: teacher.joiningDate,
                photo: teacher.photo,
            });
        }
    }, [teacher]);

    const addClass = () => {
        const classString = `${currentClass}${currentSection}`;
        if (!formData.classes.includes(classString)) {
            setFormData(prev => ({
                ...prev,
                classes: [...prev.classes, classString]
            }));
        }
    };

    const removeClass = (cls: string) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.filter(c => c !== cls)
        }));
    };

    const updateTeacherMutation = useMutation({
        mutationFn: updateTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] });
            alert('Teacher updated successfully!');
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTeacherMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Edit Teacher">
                <div className="text-center py-8 text-gray-400">Loading...</div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Teacher">
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

                {/* Class Assignment */}
                <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-orange-500 bg-opacity-20 rounded-lg text-orange-400">📚</span>
                        Assign Classes
                    </h3>
                    <div className="flex gap-4 items-end mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                            <select
                                value={currentClass}
                                onChange={(e) => setCurrentClass(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1} className="bg-gray-900">{i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                            <select
                                value={currentSection}
                                onChange={(e) => setCurrentSection(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            >
                                {['A', 'B', 'C', 'D'].map((sec) => (
                                    <option key={sec} value={sec} className="bg-gray-900">{sec}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            type="button"
                            onClick={addClass}
                            className="bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            Add
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.classes.map((cls) => (
                            <div key={cls} className="flex items-center gap-2 px-3 py-1 bg-black bg-opacity-30 rounded-full border border-gray-600">
                                <span className="text-white text-sm font-medium">{cls}</span>
                                <button
                                    type="button"
                                    onClick={() => removeClass(cls)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {formData.classes.length === 0 && (
                            <p className="text-gray-500 text-sm italic">No classes assigned yet.</p>
                        )}
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
                        disabled={updateTeacherMutation.isPending}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {updateTeacherMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
