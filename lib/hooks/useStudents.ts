import { useEffect, useState } from 'react';
import { api } from '../api';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  class: string;
  email?: string;
  phone?: string;
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
      const data = await api.students.getAll();
      
      let filteredData = data;
      if (classFilter) {
        filteredData = data.filter((s: Student) => s.class === classFilter);
      }
      
      setStudents(filteredData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      const newStudent = await api.students.create(student);
      setStudents([...students, newStudent]);
      return newStudent;
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updatedStudent = await api.students.update(id, updates);
      setStudents(students.map((s) => (s.id === id ? updatedStudent : s)));
      return updatedStudent;
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await api.students.delete(id);
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
}
