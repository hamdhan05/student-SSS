import { useState } from 'react';
import StudentCard from './StudentCard';
import Input from '@/components/UI/Input';

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

interface StudentListProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
  showSearch?: boolean;
}

export default function StudentList({
  students,
  onStudentClick,
  showSearch = true,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={onStudentClick}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No students found matching your criteria.
        </div>
      )}
    </div>
  );
}
