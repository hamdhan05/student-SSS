import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createHomework, getHomework } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

interface TeacherHomeworkProps {
    assignedClasses: string[]; // e.g. ["10A", "9B"]
}

export default function TeacherHomework({ assignedClasses }: TeacherHomeworkProps) {
    const queryClient = useQueryClient();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [viewClass, setViewClass] = useState<string>('');
    const [viewSection, setViewSection] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        title: '',
        description: '',
        dueDate: '',
    });

    const [isCreateMode, setIsCreateMode] = useState(false);

    // Derived states
    const availableClasses = Array.from(new Set(assignedClasses.map(ac => ac.replace(/\D/g, ''))));

    const getSectionsForClass = (cls: string) => {
        return assignedClasses
            .filter(ac => ac.startsWith(cls))
            .map(ac => ac.replace(cls, ''));
    };

    // Queries
    const { data: homeworkList = [] } = useQuery({
        queryKey: ['homework', viewClass, viewSection],
        queryFn: () => getHomework({ classId: viewClass, section: viewSection || undefined }),
        enabled: !!viewClass
    });

    // Mutation
    const createMutation = useMutation({
        mutationFn: createHomework,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework'] });
            alert('Homework assigned successfully!');
            setIsCreateMode(false);
            setFormData({ subject: '', title: '', description: '', dueDate: '' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || !selectedSection) {
            alert('Please select class and section');
            return;
        }

        createMutation.mutate({
            class: selectedClass,
            section: selectedSection,
            ...formData,
            createdBy: 'Teacher', // In a real app, this would be the teacher's ID
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-600 dark:text-white">Homework Management</h2>
                <Button onClick={() => setIsCreateMode(!isCreateMode)} variant={isCreateMode ? 'secondary' : 'primary'}>
                    {isCreateMode ? 'Cancel' : 'Assign New Homework'}
                </Button>
            </div>

            {isCreateMode && (
                <div className="card p-6 border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10">
                    <h3 className="text-xl font-bold text-gray-600 dark:text-white mb-4">Assign Homework</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => {
                                        setSelectedClass(e.target.value);
                                        setSelectedSection('');
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {availableClasses.map(cls => (
                                        <option key={cls} value={cls}>Class {cls}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section</label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!selectedClass}
                                >
                                    <option value="">Select Section</option>
                                    {selectedClass && getSectionsForClass(selectedClass).map(sec => (
                                        <option key={sec} value={sec}>Section {sec}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                                <Input
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="e.g. Mathematics"
                                    required
                                    className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                                <Input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Homework Title"
                                required
                                className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                placeholder="Detailed instructions..."
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
                                {createMutation.isPending ? 'Assigning...' : 'Assign Homework'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Homework */}
            <div className="space-y-4">
                <div className="flex gap-4 items-center bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">View Homework For:</span>
                    <select
                        value={viewClass}
                        onChange={(e) => setViewClass(e.target.value)}
                        className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white px-3 py-1 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Class</option>
                        {availableClasses.map(cls => (
                            <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                    </select>
                    <select
                        value={viewSection}
                        onChange={(e) => setViewSection(e.target.value)}
                        className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white px-3 py-1 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Sections</option>
                        {['A', 'B', 'C'].map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                    </select>
                </div>

                {viewClass ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homeworkList.map((hw: any) => (
                            <div key={hw.id} className="card p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 transition-colors shadow-sm dark:shadow-none">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 text-xs font-bold uppercase">
                                        {hw.subject}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(hw.dueDate).toLocaleDateString()}</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-600 dark:text-white mb-2">{hw.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{hw.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <span>Class {hw.class}-{hw.section}</span>
                                    <span>Assigned: {new Date(hw.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {homeworkList.length === 0 && (
                            <div className="col-span-full card p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10">
                                No homework assigned for this class yet.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10">
                        Select a class above to view assigned homework.
                    </div>
                )}
            </div>
        </div>
    );
}
