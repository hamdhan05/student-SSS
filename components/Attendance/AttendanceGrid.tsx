import { useState } from 'react';
import Calendar from '@/components/UI/Calendar';
import Button from '@/components/UI/Button';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceGridProps {
  students: Student[];
  date: Date;
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  existingRecords?: AttendanceRecord[];
}

export default function AttendanceGrid({
  students,
  date,
  onSaveAttendance,
  existingRecords = [],
}: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>(
    () => {
      const initial: Record<string, 'present' | 'absent' | 'late'> = {};
      existingRecords.forEach((record) => {
        initial[record.studentId] = record.status;
      });
      return initial;
    }
  );

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      date: date.toISOString().split('T')[0],
      status,
    }));
    onSaveAttendance(records);
  };

  const getStatusColor = (status?: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Attendance for {date.toLocaleDateString()}
        </h3>
        <Button onClick={handleSave}>Save Attendance</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Roll No.</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-center">Present</th>
              <th className="px-4 py-2 text-center">Absent</th>
              <th className="px-4 py-2 text-center">Late</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{student.rollNumber}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`w-6 h-6 rounded-full ${
                      attendance[student.id] === 'present'
                        ? getStatusColor('present')
                        : 'bg-gray-200'
                    }`}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`w-6 h-6 rounded-full ${
                      attendance[student.id] === 'absent'
                        ? getStatusColor('absent')
                        : 'bg-gray-200'
                    }`}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`w-6 h-6 rounded-full ${
                      attendance[student.id] === 'late'
                        ? getStatusColor('late')
                        : 'bg-gray-200'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
