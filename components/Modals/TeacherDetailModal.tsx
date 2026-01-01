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
                    <div className="flex items-center justify-between border-b border-gray-700 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-black bg-opacity-50 border border-gray-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden shrink-0">
                                {teacher.photo && teacher.photo !== '/images/teachers/default.jpg' ? (
                                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(teacher.name)
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{teacher.name}</h2>
                                <p className="text-gray-400 text-sm">{teacher.domain}</p>
                                <p className="text-gray-400 text-sm">{teacher.qualification}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Email</p>
                                    <p className="text-white font-medium">{teacher.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Phone</p>
                                    <p className="text-white font-medium">{teacher.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Address</p>
                                    <p className="text-white font-medium">{teacher.address}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Date of Birth</p>
                                    <p className="text-white font-medium">{teacher.dateOfBirth}</p>
                                </div>
                            </div>
                        </div>

                        {/* Professional & Family Information */}
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Professional & Family</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Experience</p>
                                    <p className="text-white font-medium">{teacher.experience}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Joining Date</p>
                                    <p className="text-white font-medium">{teacher.joiningDate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Father Name</p>
                                    <p className="text-white font-medium">{teacher.fatherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Mother Name</p>
                                    <p className="text-white font-medium">{teacher.motherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Classes Assigned</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {teacher.classes && teacher.classes.length > 0 ? (
                                            teacher.classes.map((cls: string) => (
                                                <span key={cls} className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded text-xs font-medium border border-blue-500 border-opacity-30">
                                                    {cls}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm italic">No classes assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">Teacher not found</div>
            )}
        </Modal>
    );
}
