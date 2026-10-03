import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClasses, getSections } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import Input from '@/components/UI/Input';
import FeeEditModal from '@/components/Modals/FeeEditModal';

export default function Fees() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ['db_classes_fees'],
    queryFn: async () => {
        return await getClasses();
    }
  });

  const { data: feesData = [], isLoading } = useQuery({
    queryKey: ['all_student_fees', selectedClass, selectedSection, searchQuery],
    queryFn: async () => {
      let query = supabase.from('students').select(`
        id, name, roll_number, section, classes(id, name),
        student_fee_records(amount, paid_amount, due_amount),
        student_sports(fee_amount, paid_amount)
      `);

      if (selectedClass) {
        query = query.eq('class_id', selectedClass.toString());
      }
      if (selectedSection) {
        query = query.eq('section', selectedSection);
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { totalAmount, paidAmount, pendingAmount, filteredFees } = useMemo(() => {
    let tAmount = 0;
    let pAmount = 0;
    
    const mapped = feesData.map((student: any) => {
        let scTotal = 0, scPaid = 0, scDue = 0;
        (student.student_fee_records || []).forEach((f: any) => {
            scTotal += Number(f.amount || 0);
            scPaid += Number(f.paid_amount || 0);
            scDue += Number(f.due_amount || 0);
        });

        let spTotal = 0, spPaid = 0;
        (student.student_sports || []).forEach((s: any) => {
            spTotal += Number(s.fee_amount || 0);
            spPaid += Number(s.paid_amount || 0);
        });

        const studentTotal = scTotal + spTotal;
        const studentPaid = scPaid + spPaid;
        const studentDue = studentTotal - studentPaid;

        tAmount += studentTotal;
        pAmount += studentPaid;

        return {
            id: student.id,
            rollNumber: student.roll_number,
            name: student.name,
            class: student.classes?.name,
            section: student.section,
            schoolTotal: scTotal,
            sportsTotal: spTotal,
            overallTotal: studentTotal,
            overallPaid: studentPaid,
            overallDue: studentDue
        };
    });

    return {
        totalAmount: tAmount,
        paidAmount: pAmount,
        pendingAmount: tAmount - pAmount,
        filteredFees: mapped
    };
  }, [feesData]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-600 dark:text-white">Fee Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-white">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="card p-6 border-green-600">
          <h3 className="text-sm text-gray-400 mb-2">Collected</h3>
          <p className="text-3xl font-bold text-green-400">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="card p-6 border-red-600">
          <h3 className="text-sm text-gray-400 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-red-400">₹{pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              variant="glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 rounded-lg bg-surface text-gray-600 border border-gray-200 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-light dark:focus:ring-blue-500"
            >
              <option value="" className="bg-white text-gray-900 dark:bg-black dark:text-white">All Classes</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id} className="bg-white text-gray-900 dark:bg-black dark:text-white">
                  Class {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
            <Input
                placeholder="Section (e.g. A)"
                value={selectedSection || ''}
                onChange={(e) => setSelectedSection(e.target.value || null)}
                variant="glass"
            />
          </div>
        </div>
      </div>

      {/* Fees Table */}
      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading fees data...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Roll No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Student Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white">Class/Sec</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">School Fee</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Sports Fee</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Overall Total</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Overall Paid</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Overall Due</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((item: any) => {
                return (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.class}-{item.section}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white text-right font-medium">₹{item.schoolTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white text-right font-medium">₹{item.sportsTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 text-right font-bold">₹{item.overallTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 text-right font-bold">₹{item.overallPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 text-right font-bold">₹{item.overallDue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingStudentId(item.id);
                          setEditModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredFees.length === 0 && (
            <div className="p-8 text-center text-gray-400">No fee records found</div>
          )}
        </div>
      )}
      
      {editingStudentId && (
        <FeeEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingStudentId(null);
          }}
          studentId={editingStudentId}
        />
      )}
    </div>
  );
}