import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import Modal from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

interface FeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string | null;
}

export default function FeeEditModal({ isOpen, onClose, studentId }: FeeEditModalProps) {
    const queryClient = useQueryClient();

    // UI state
    const [selectedTab, setSelectedTab] = useState<'school' | 'sports'>('school');
    
    // Payment inputs state mapping ID to amount
    const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
    const [sportsPaymentAmounts, setSportsPaymentAmounts] = useState<Record<string, string>>({});

    const { data: student } = useQuery({
        queryKey: ['student_for_fees', studentId],
        queryFn: async () => {
            if (!studentId) return null;
            const { data, error } = await supabase
                .from('students')
                .select('id, name, admission_number, section, classes(name)')
                .eq('id', studentId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: isOpen && !!studentId
    });

    const { data: schoolFees = [], isLoading: loadingFees } = useQuery({
        queryKey: ['student_school_fees', studentId],
        queryFn: async () => {
            if (!studentId) return [];
            const { data, error } = await supabase
                .from('student_fee_records')
                .select('*, fee_type:fee_types(name)')
                .eq('student_id', studentId);
            if (error) throw error;
            return data;
        },
        enabled: isOpen && !!studentId
    });

    const { data: sportsFees = [], isLoading: loadingSports } = useQuery({
        queryKey: ['student_sports_fees', studentId],
        queryFn: async () => {
            if (!studentId) return [];
            const { data, error } = await supabase
                .from('student_sports')
                .select('*, sport:sports(name)')
                .eq('student_id', studentId);
            if (error) throw error;
            return data;
        },
        enabled: isOpen && !!studentId
    });

    const updateSchoolFeeMutation = useMutation({
        mutationFn: async ({ recordId, amount }: { recordId: string, amount: number }) => {
            const record = schoolFees.find((r: any) => r.id === recordId);
            if (!record) throw new Error('Record not found');

            const newPaid = Number(record.paid_amount) + amount;
            
            const { error } = await supabase
                .from('student_fee_records')
                .update({ paid_amount: newPaid })
                .eq('id', recordId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student_school_fees'] });
            setPaymentAmounts({});
        }
    });

    const updateSportsFeeMutation = useMutation({
        mutationFn: async ({ recordId, amount }: { recordId: string, amount: number }) => {
            const record = sportsFees.find((r: any) => r.id === recordId);
            if (!record) throw new Error('Record not found');

            const newPaid = Number(record.paid_amount) + amount;
            
            const { error } = await supabase
                .from('student_sports')
                .update({ paid_amount: newPaid })
                .eq('id', recordId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student_sports_fees'] });
            setSportsPaymentAmounts({});
        }
    });

    const handleSchoolPayment = (recordId: string, maxDue: number) => {
        const amount = Number(paymentAmounts[recordId] || 0);
        if (amount <= 0) return alert('Enter a valid amount');
        if (amount > maxDue) return alert('Payment cannot exceed due amount');
        updateSchoolFeeMutation.mutate({ recordId, amount });
    };

    const handleSportsPayment = (recordId: string, maxDue: number) => {
        const amount = Number(sportsPaymentAmounts[recordId] || 0);
        if (amount <= 0) return alert('Enter a valid amount');
        if (amount > maxDue) return alert('Payment cannot exceed due amount');
        updateSportsFeeMutation.mutate({ recordId, amount });
    };

    const { schoolTotal, schoolPaid, schoolDue, sportsTotal, sportsPaid, sportsDue } = useMemo(() => {
        let scTotal = 0, scPaid = 0, scDue = 0;
        schoolFees.forEach((f: any) => {
            scTotal += Number(f.amount);
            scPaid += Number(f.paid_amount);
            scDue += Number(f.due_amount); // Trigger auto calculates this or we fallback: (f.amount - f.paid_amount)
        });

        let spTotal = 0, spPaid = 0, spDue = 0;
        sportsFees.forEach((f: any) => {
            spTotal += Number(f.fee_amount);
            spPaid += Number(f.paid_amount);
            spDue += (Number(f.fee_amount) - Number(f.paid_amount));
        });

        return {
            schoolTotal: scTotal, schoolPaid: scPaid, schoolDue: scDue || (scTotal - scPaid),
            sportsTotal: spTotal, sportsPaid: spPaid, sportsDue: spDue
        };
    }, [schoolFees, sportsFees]);

    const overallTotal = schoolTotal + sportsTotal;
    const overallPaid = schoolPaid + sportsPaid;
    const overallDue = schoolDue + sportsDue;

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Fee Collection Management" size="xl">
            <div className="space-y-6">
                {/* Student Info */}
                {student && (
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{student.name}</h3>
                            <p className="text-sm text-gray-500">Admn: {student.admission_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Class {(student.classes as any)?.name} - {student.section}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        className={`pb-2 px-4 font-medium ${selectedTab === 'school' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setSelectedTab('school')}
                    >
                        School Fees
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium ${selectedTab === 'sports' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setSelectedTab('sports')}
                    >
                        Sports Fees
                    </button>
                </div>

                {/* School Fees */}
                {selectedTab === 'school' && (
                    <div className="space-y-4">
                        {loadingFees ? <p>Loading fees...</p> : schoolFees.length === 0 ? <p>No school fees assigned.</p> : (
                            <table className="w-full text-left text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="pb-2">Fee Type</th>
                                        <th className="pb-2">Total Amount</th>
                                        <th className="pb-2">Paid</th>
                                        <th className="pb-2">Due</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Make Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {schoolFees.map((f: any) => {
                                        const due = Number(f.amount) - Number(f.paid_amount);
                                        return (
                                            <tr key={f.id}>
                                                <td className="py-3 font-medium">{f.fee_type?.name}</td>
                                                <td className="py-3">₹{f.amount}</td>
                                                <td className="py-3 text-green-600">₹{f.paid_amount}</td>
                                                <td className="py-3 text-red-500">₹{due}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${due <= 0 ? 'bg-green-100 text-green-700' : f.paid_amount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {due <= 0 ? 'Paid' : f.paid_amount > 0 ? 'Partial' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-3 flex justify-end gap-2">
                                                    {due > 0 ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                className="w-24 px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                placeholder="Amount"
                                                                value={paymentAmounts[f.id] || ''}
                                                                onChange={(e) => setPaymentAmounts({ ...paymentAmounts, [f.id]: e.target.value })}
                                                            />
                                                            <Button size="sm" onClick={() => handleSchoolPayment(f.id, due)}>Pay</Button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Completed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Sports Fees */}
                {selectedTab === 'sports' && (
                    <div className="space-y-4">
                        {loadingSports ? <p>Loading sports fees...</p> : sportsFees.length === 0 ? <p className="text-gray-500">No sports selected for this student.</p> : (
                            <table className="w-full text-left text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="pb-2">Sport</th>
                                        <th className="pb-2">Fee</th>
                                        <th className="pb-2">Paid</th>
                                        <th className="pb-2">Due</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Make Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {sportsFees.map((f: any) => {
                                        const due = Number(f.fee_amount) - Number(f.paid_amount);
                                        return (
                                            <tr key={f.id}>
                                                <td className="py-3 font-medium">{f.sport?.name}</td>
                                                <td className="py-3">₹{f.fee_amount}</td>
                                                <td className="py-3 text-green-600">₹{f.paid_amount}</td>
                                                <td className="py-3 text-red-500">₹{due}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${due <= 0 ? 'bg-green-100 text-green-700' : f.paid_amount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {due <= 0 ? 'Paid' : f.paid_amount > 0 ? 'Partial' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-3 flex justify-end gap-2">
                                                    {due > 0 ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                className="w-24 px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                placeholder="Amount"
                                                                value={sportsPaymentAmounts[f.id] || ''}
                                                                onChange={(e) => setSportsPaymentAmounts({ ...sportsPaymentAmounts, [f.id]: e.target.value })}
                                                            />
                                                            <Button size="sm" onClick={() => handleSportsPayment(f.id, due)}>Pay</Button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Completed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Overall Summary */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">Overall Financial Summary</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 pb-4 border-b border-blue-200 dark:border-blue-800">
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-400">School Fees Total</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{schoolTotal}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-400">Sports Fees Total</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{sportsTotal}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">Overall Total</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">₹{overallTotal}</p>
                        </div>
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-400 font-bold uppercase tracking-wide">Overall Paid</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400">₹{overallPaid}</p>
                        </div>
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-400 font-bold uppercase tracking-wide">Overall Due</p>
                            <p className="text-2xl font-black text-red-500">₹{overallDue}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Close Window</Button>
                </div>
            </div>
        </Modal>
    );
}
