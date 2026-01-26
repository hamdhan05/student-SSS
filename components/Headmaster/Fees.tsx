import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentFees, getClasses, getSections } from '@/lib/api';
import Input from '@/components/UI/Input';

import FeeEditModal from '@/components/Modals/FeeEditModal';

export default function Fees() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => getSections(),
  });

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['fees', selectedClass, selectedSection, searchQuery],
    queryFn: () => getStudentFees({
      classId: selectedClass?.toString(),
      section: selectedSection || undefined,
      q: searchQuery || undefined,
    }),
  });

  const filteredFees = Array.isArray(fees) ? fees : [];

  const totalAmount = filteredFees.reduce((sum: number, item: any) => sum + (item.fees?.totalFee || 0), 0);
  const paidAmount = filteredFees.reduce((sum: number, item: any) => sum + (item.fees?.paidAmount || 0), 0);
  const pendingAmount = filteredFees.reduce((sum: number, item: any) => sum + (item.fees?.dueAmount || 0), 0);

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
              placeholder="Search by name or roll..."
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
              {classes.map((cls) => (
                <option key={cls} value={cls} className="bg-white text-gray-900 dark:bg-black dark:text-white">
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
            <select
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg bg-surface text-gray-600 border border-gray-200 dark:bg-white dark:bg-opacity-10 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-light dark:focus:ring-blue-500"
            >
              <option value="" className="bg-white text-gray-900 dark:bg-black dark:text-white">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec} className="bg-white text-gray-900 dark:bg-black dark:text-white">
                  Section {sec}
                </option>
              ))}
            </select>
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Total</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Paid</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Due</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-white">Term 1</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-white">Term 2</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-white">Term 3</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((item: any) => {
                const { student, fees: feeData } = item;
                const terms = feeData.terms || [];
                const term1 = terms.find((t: any) => t.name === 'Term 1');
                const term2 = terms.find((t: any) => t.name === 'Term 2');
                const term3 = terms.find((t: any) => t.name === 'Term 3');

                const renderTermStatus = (term: any) => {
                  if (!term) return <span className="text-gray-500">-</span>;
                  const colors = {
                    paid: 'bg-green-900 text-green-400',
                    pending: 'bg-yellow-900 text-yellow-400',
                    overdue: 'bg-red-900 text-red-400',
                  };
                  return (
                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-opacity-30 ${colors[term.status as keyof typeof colors]}`}>
                        {term.status}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">₹{term.amount.toLocaleString()}</span>
                    </div>
                  );
                };

                return (
                  <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.class}-{student.section}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white text-right font-medium">₹{feeData.totalFee.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 text-right">₹{feeData.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 text-right">₹{feeData.dueAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">{renderTermStatus(term1)}</td>
                    <td className="px-6 py-4 text-center">{renderTermStatus(term2)}</td>
                    <td className="px-6 py-4 text-center">{renderTermStatus(term3)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingFee(item);
                          setEditModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Edit
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
      {editingFee && (
        <FeeEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingFee(null);
          }}
          student={{
            id: editingFee.student.id,
            name: editingFee.student.name,
            rollNumber: editingFee.student.rollNumber
          }}
          initialTerms={editingFee.fees.terms || []}
        />
      )}
    </div>
  );
}