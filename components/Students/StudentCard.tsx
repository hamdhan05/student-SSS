interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  class: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface StudentCardProps {
  student: Student;
  onClick?: (student: Student) => void;
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <div
      onClick={() => onClick?.(student)}
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            student.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-600">Roll No: {student.rollNumber}</p>
          <p className="text-sm text-gray-600">
            {student.class} - Grade {student.grade}
          </p>
        </div>
      </div>

      {(student.email || student.phone) && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
          {student.email && (
            <p className="text-xs text-gray-500">📧 {student.email}</p>
          )}
          {student.phone && (
            <p className="text-xs text-gray-500">📞 {student.phone}</p>
          )}
        </div>
      )}
    </div>
  );
}
