import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStudents, updateAcademicRecordBatch, getAcademicsByStudent } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

interface TeacherMarksProps {
    assignedClasses: string[]; // e.g. ["10A", "9B"]
}

export default function TeacherMarks({ assignedClasses }: TeacherMarksProps) {
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
    const [totalMarks, setTotalMarks] = useState<number>(100);

    // Map of studentId -> marks obtained
    const [marksData, setMarksData] = useState<Record<string, number>>({});

    const availableClasses = Array.from(new Set(assignedClasses.map(ac => ac.replace(/\D/g, ''))));

    const getSectionsForClass = (cls: string) => {
        return assignedClasses
            .filter(ac => ac.startsWith(cls))
            .map(ac => ac.replace(cls, ''));
    };

    const { data: studentsResult, isLoading: studentsLoading } = useQuery({
        queryKey: ['students', selectedClass, selectedSection],
        queryFn: () => getStudents({ classId: selectedClass, section: selectedSection, limit: 100 }),
        enabled: !!selectedClass && !!selectedSection,
    });

    const students = studentsResult?.data || [];

    // Reset marks when selection changes
    useEffect(() => {
        setMarksData({});
    }, [selectedClass, selectedSection, selectedSubject, selectedTerm]);

    const updateMutation = useMutation({
        mutationFn: updateAcademicRecordBatch,
        onSuccess: () => {
            alert('Marks updated successfully!');
            setMarksData({});
        }
    });

    const handleSubmit = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !selectedTerm) {
            alert('Please fill all selection fields');
            return;
        }

        const marksPayload = Object.entries(marksData).map(([studentId, marks]) => ({
            studentId,
            marks,
            totalMarks
        }));

        if (marksPayload.length === 0) {
            alert('Please enter marks for at least one student');
            return;
        }

        updateMutation.mutate({
            classId: selectedClass,
            section: selectedSection,
            subject: selectedSubject,
            term: selectedTerm,
            marks: marksPayload
        });
    };

    const handleMarkChange = (studentId: string, val: string) => {
        const num = Number(val);
        if (!isNaN(num) && num >= 0 && num <= totalMarks) {
            setMarksData(prev => ({ ...prev, [studentId]: num }));
        }
    };

    // Pre-fill button (mock function to autofill random marks for testing)
    const autoFill = () => {
        const newMarks: Record<string, number> = {};
        students.forEach((s: any) => {
            if (!marksData[s.id]) {
                newMarks[s.id] = Math.floor(Math.random() * (totalMarks - 40)) + 40;
            }
        });
        setMarksData(prev => ({ ...prev, ...newMarks }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-600 dark:text-white">Academic Marks Entry</h2>

            <div className="card p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedSection('');
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            disabled={!selectedClass}
                        >
                            <option value="">Select Section</option>
                            {selectedClass && getSectionsForClass(selectedClass).map(sec => (
                                <option key={sec} value={sec}>Section {sec}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                        <Input
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                            <option value="Final">Final</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Marks</label>
                        <Input
                            type="number"
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(Number(e.target.value))}
                            className="bg-white dark:bg-gray-800 text-gray-600 dark:text-white border border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div className="pt-7">
                        <Button onClick={autoFill} variant="secondary" className="text-sm">Auto-fill (Test)</Button>
                    </div>
                </div>

                {studentsLoading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading students...</div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-black/30">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Roll No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Marks (/{totalMarks})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                                {students.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.rollNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-white">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max={totalMarks}
                                                value={marksData[student.id] || ''}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                className="w-24 px-3 py-1 bg-white dark:bg-white/10 text-gray-600 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                                placeholder="-"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length > 0 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-black/20">
                                <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="px-8 flex-shrink-0">
                                    {updateMutation.isPending ? 'Saving...' : 'Save Marks'}
                                </Button>
                            </div>
                        )}
                        {students.length === 0 && selectedClass && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No students found in this class.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
