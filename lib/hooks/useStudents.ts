import { useEffect, useState } from 'react';
import { getStudents, createStudent, updateStudent } from '../api';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string; // Added section as it is in api.ts types
  email: string;
  phone: string;
  [key: string]: any; // Allow other properties
}

export function useStudents(classFilter?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // api.ts getStudents returns { data: [], total: ... }
      const response = await getStudents({ classId: classFilter, limit: 100 });

      setStudents(response.data as unknown as Student[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'admissionDate' | 'photo'>) => {
    try {
      const newStudent = await createStudent(student as any);
      setStudents([...students, newStudent as unknown as Student]);
      return newStudent;
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const updateStudentFn = async (id: string, updates: Partial<Student>) => {
    try {
      // Assuming updateStudent takes the whole object or partial. api.ts takes whole object.
      // We need to find the student and merge.
      const studentToUpdate = students.find(s => s.id === id);
      if (!studentToUpdate) throw new Error("Student not found locally");

      const merged = { ...studentToUpdate, ...updates };
      const updatedStudent = await updateStudent(merged as any);
      setStudents(students.map((s) => (s.id === id ? updatedStudent as unknown as Student : s)));
      return updatedStudent;
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  // deleteStudent is not supported by api.ts yet
  const deleteStudent = async (id: string) => {
    console.warn("Delete student is not implemented in API");
    // Simulate local delete
    setStudents(students.filter((s) => s.id !== id));
  };

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent: updateStudentFn,
    deleteStudent,
    refetch: fetchStudents,
  };
}
