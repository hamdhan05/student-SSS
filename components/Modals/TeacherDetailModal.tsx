import { useQuery } from '@tanstack/react-query';
import { getTeacherById } from '@/lib/api';
import Modal from '@/components/UI/Modal';

interface TeacherDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
}

export default function TeacherDetailModal({
    isOpen,
    onClose,
    teacherId,
}: TeacherDetailModalProps) {
    const { data: teacher, isLoading } = useQuery({
        queryKey: ['teacher', teacherId],
        queryFn: () => getTeacherById(teacherId),
        enabled: isOpen && !!teacherId,
    });

    if (!isOpen) return null;

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : teacher ? (
                <div className="space-y-6">
                    {/* Header with Avatar */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-white text-2xl font-bold shadow-lg overflow-hidden shrink-0">
                                {teacher.photo && teacher.photo !== '/images/teachers/default.jpg' ? (
                                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(teacher.name)
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.name}</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{teacher.domain}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{teacher.qualification}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        {/* Personal Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Email</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Phone</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Address</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.address}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Date of Birth</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.dateOfBirth}</p>
                                </div>
                            </div>
                        </div>

                        {/* Professional & Family Information */}
                        {/* Professional & Family Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Professional & Family</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Experience</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.experience}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Joining Date</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.joiningDate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Father Name</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.fatherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Mother Name</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{teacher.motherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Classes Assigned</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {teacher.classes && teacher.classes.length > 0 ? (
                                            teacher.classes.map((cls: string) => (
                                                <span key={cls} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-500 dark:bg-opacity-20 dark:text-blue-300 rounded text-xs font-medium border border-blue-200 dark:border-blue-500 dark:border-opacity-30">
                                                    {cls}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500 text-sm italic">No classes assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Timetable */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Timetable</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Day</th>
                                        <th className="px-4 py-3 font-semibold">09:00 - 09:45</th>
                                        <th className="px-4 py-3 font-semibold">10:00 - 10:45</th>
                                        <th className="px-4 py-3 font-semibold">11:00 - 11:45</th>
                                        <th className="px-4 py-3 font-semibold">12:00 - 12:45</th>
                                        <th className="px-4 py-3 font-semibold rounded-tr-lg">14:00 - 14:45</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                                        <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{day}</td>
                                            {/* Generate deterministic mock schedule based on teacher name and day */}
                                            {[1, 2, 3, 4, 5].map((period) => {
                                                const seed = day.charCodeAt(0) + period + teacher.name.length;
                                                const hasClass = seed % 3 !== 0; // 2/3 chance of having a class
                                                
                                                if (!hasClass) {
                                                    return <td key={period} className="px-4 py-3 text-gray-400 dark:text-gray-500 italic">Free</td>;
                                                }
                                                
                                                // Pick a random class from their assigned classes, or fallback to a default
                                                const classes = teacher.classes && teacher.classes.length > 0 
                                                    ? teacher.classes 
                                                    : ['Class 10 - A', 'Class 9 - B', 'Class 11 - Science'];
                                                const assignedClass = classes[seed % classes.length];
                                                
                                                return (
                                                    <td key={period} className="px-4 py-3">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{assignedClass}</div>
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">{teacher.subject || teacher.domain}</div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">Teacher not found</div>
            )}
        </Modal>
    );
}
