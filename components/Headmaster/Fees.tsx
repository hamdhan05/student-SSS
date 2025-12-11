import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentFees, getClasses, getSections } from '@/lib/api';
import Input from '@/components/UI/Input';

export default function Fees() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      <h2 className="text-3xl font-bold text-white">Fee Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-sm text-gray-400 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-white">₹{totalAmount.toLocaleString()}</p>
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
              className="bg-white bg-opacity-10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls} className="bg-black">
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
              className="w-full px-4 py-2 rounded bg-white bg-opacity-10 text-white border border-gray-600"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec} className="bg-black">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Roll No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Section</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Month</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((item: any) => {
                const { student, fees: feeData } = item;
                const status = feeData.dueAmount === 0 ? 'paid' : 'pending';
                return (
                  <tr key={student.id} className="border-b border-gray-800 hover:bg-white hover:bg-opacity-5">
                    <td className="px-6 py-4 text-sm text-gray-300">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{student.section}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">December 2025</td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-right">₹{feeData.totalFee}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === 'paid'
                            ? 'bg-green-900 bg-opacity-50 text-green-400'
                            : 'bg-red-900 bg-opacity-50 text-red-400'
                        }`}
                      >
                        {status}
                      </span>
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
    </div>
  );
}