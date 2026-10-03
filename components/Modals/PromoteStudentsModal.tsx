import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { getClasses } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface PromoteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoteStudentsModal({ isOpen, onClose }: PromoteStudentsModalProps) {
  const queryClient = useQueryClient();
  const [fromClassId, setFromClassId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  const fromClass = classes.find((c: any) => c.id === fromClassId);
  // Determine if high school (10th, 11th, 12th) based on class name
  const isHighSchool = fromClass?.name?.match(/(10|11|12)/) !== null && fromClass?.name !== undefined;

  // Fetch students when fromClassId changes
  useEffect(() => {
    async function fetchStudents() {
      if (!fromClassId) {
        setStudents([]);
        setSelectedStudentIds(new Set());
        return;
      }
      setIsFetchingStudents(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, name, admission_number, roll_number, section')
          .eq('class_id', fromClassId);
          
        if (error) throw error;
        
        setStudents(data || []);
        setSelectedStudentIds(new Set(data?.map((s: any) => s.id) || []));
      } catch (err: any) {
        setError('Failed to fetch students: ' + err.message);
      } finally {
        setIsFetchingStudents(false);
      }
    }
    fetchStudents();
  }, [fromClassId]);

  const toggleStudent = (id: string) => {
    if (!isHighSchool) return; // Disallow toggling if automatic promotion (<= 9th)
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const toggleAll = () => {
    if (!isHighSchool) return;
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.id)));
    }
  };

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (selectedStudentIds.size === 0) throw new Error('No students selected');
      if (!toClassId) throw new Error('Target class is required');
      if (!newAcademicYear) throw new Error('New Academic Year is required');

      const idsToPromote = Array.from(selectedStudentIds);

      // 1. Fetch the target class fee structures
      const { data: feeStructures, error: fsError } = await supabase
        .from('class_fee_structures')
        .select('*')
        .eq('class_id', toClassId);
      
      if (fsError) throw fsError;

      // 2. Prepare the new fee records
      const feeRecordsToInsert: any[] = [];
      
      idsToPromote.forEach(studentId => {
        if (feeStructures && feeStructures.length > 0) {
          feeStructures.forEach((fs: any) => {
            feeRecordsToInsert.push({
              student_id: studentId,
              fee_type_id: fs.fee_type_id,
              amount: fs.amount,
              paid_amount: 0,
              due_amount: fs.amount,
              academic_year: newAcademicYear,
              payment_status: 'pending'
            });
          });
        }
      });

      // 3. Bulk Update Students table
      const { error: updateError } = await supabase
        .from('students')
        .update({
          class_id: toClassId,
          academic_year: newAcademicYear
        })
        .in('id', idsToPromote);

      if (updateError) throw updateError;

      // 4. Bulk Insert new fee records
      if (feeRecordsToInsert.length > 0) {
        const { error: feeInsertError } = await supabase
          .from('student_fee_records')
          .insert(feeRecordsToInsert);
        
        if (feeInsertError) throw feeInsertError;
      }
      
      // 5. Audit History and Gradebook Initialization
      const historyRecords = idsToPromote.map(id => ({
          student_id: id,
          from_class_id: fromClassId,
          to_class_id: toClassId,
          academic_year: newAcademicYear
      }));
      try {
          await supabase.from('student_academic_history').insert(historyRecords);
      } catch (e) {}

      const defaultSubjects = ['Mathematics', 'Science', 'English', 'History', 'Physics'];
      const academicRecordsToInsert: any[] = [];
      idsToPromote.forEach(id => {
          defaultSubjects.forEach(sub => {
              academicRecordsToInsert.push({
                  student_id: id,
                  subject: sub,
                  marks: null,
                  total_marks: 100,
                  grade: null,
                  term: 'Term 1'
              });
          });
      });
      await supabase.from('academic_records').insert(academicRecordsToInsert);

      try {
          await supabase.from('system_logs').insert({
              action: 'Bulk Promotion',
              description: `Promoted ${idsToPromote.length} students from class ${fromClassId} to ${toClassId} for ${newAcademicYear}.`,
          });
      } catch (e) {}

      return idsToPromote.length;
    },
    onSuccess: (count) => {
      setSuccess(`Successfully promoted ${count} student(s)!`);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['all_student_fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['class_students'] });
      queryClient.invalidateQueries({ queryKey: ['sports_roster'] });
      queryClient.invalidateQueries({ queryKey: ['student_notices'] });
      
      setTimeout(() => {
        setFromClassId('');
        setToClassId('');
        setNewAcademicYear('');
        setSuccess(null);
        setError(null);
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to promote students');
    }
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Promote Students (Academic Year Transition)" size="xl">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-700 dark:text-red-200 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-700 dark:text-green-200 text-sm">
            {success}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Class *</label>
              <select
                value={fromClassId}
                onChange={(e) => setFromClassId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select current class...</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Class *</label>
              <select
                value={toClassId}
                onChange={(e) => setToClassId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select target class...</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="New Academic Year"
              name="academicYear"
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
              placeholder="e.g. 2024-2025"
              required
            />
          </div>
        </div>

        {fromClassId && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Students ({students.length})
              </h3>
              <div className="flex items-center gap-3">
                {!isHighSchool && (
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-1 rounded-full">
                    Auto-Promote (Up to 9th Grade)
                  </span>
                )}
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {selectedStudentIds.size} selected
                </span>
              </div>
            </div>
            
            {isFetchingStudents ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">No students found in this class.</div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100/50 dark:bg-slate-900/80 text-gray-600 dark:text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input 
                          type="checkbox"
                          checked={selectedStudentIds.size === students.length && students.length > 0}
                          onChange={toggleAll}
                          disabled={!isHighSchool}
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Admission No</th>
                      <th className="px-4 py-3 font-semibold">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700/50">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-100 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox"
                            checked={selectedStudentIds.has(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            disabled={!isHighSchool}
                            className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{student.admission_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{student.section || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} disabled={promoteMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => promoteMutation.mutate()} 
            disabled={promoteMutation.isPending || selectedStudentIds.size === 0 || !toClassId || !newAcademicYear}
          >
            {promoteMutation.isPending ? 'Promoting...' : `Promote ${selectedStudentIds.size} Students`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
