import { useQuery } from '@tanstack/react-query';
import { getStudentById, getAttendanceByStudent } from '@/lib/api';
import Modal from '@/components/UI/Modal';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  studentId,
  onEdit,
  showEdit = true,
}: StudentDetailModalProps) {
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: isOpen && !!studentId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => getAttendanceByStudent(studentId),
    enabled: isOpen && !!studentId,
  });

  if (!isOpen) return null;

  const presentCount = attendance.filter((a: any) => a.status === 'present').length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : '0';

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
      ) : student ? (
        <div className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(student.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                <p className="text-gray-400 text-sm">Roll Number: {student.rollNumber}</p>
                <p className="text-gray-400 text-sm">
                  {student.class}
                  {student.section} - Grade {student.class}
                </p>
              </div>
            </div>
            {showEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit?.();
                }}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Phone</p>
                  <p className="text-white font-medium">{student.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Date of Birth</p>
                  <p className="text-white font-medium">{student.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Address</p>
                  <p className="text-white font-medium">{student.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Parent Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Parent Name</p>
                  <p className="text-white font-medium">
                    {student.guardianName || student.parentName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Parent Phone</p>
                  <p className="text-white font-medium">
                    {student.guardianPhone || student.parentPhone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Record */}
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Attendance Record</h3>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Attendance Rate</p>
                <p className="text-green-500 text-2xl font-bold">{attendanceRate}%</p>
              </div>
            </div>

            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 5).map((record: any, index: number) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-900 text-green-300'
                                : record.status === 'absent'
                                ? 'bg-red-900 text-red-300'
                                : 'bg-yellow-900 text-yellow-300'
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attendance.length > 5 && (
                  <p className="text-center text-gray-400 text-sm mt-3">
                    Showing last 5 records out of {attendance.length}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">No attendance records found</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">Student not found</div>
      )}
    </Modal>
  );
}
