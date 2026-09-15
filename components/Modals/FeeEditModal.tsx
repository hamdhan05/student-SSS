import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFeeRecord } from '@/lib/api';
import Modal from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

interface TermFee {
    name: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
}

interface FeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: string;
        name: string;
        rollNumber: string;
    };
    initialTerms: TermFee[];
}

export default function FeeEditModal({ isOpen, onClose, student, initialTerms }: FeeEditModalProps) {
    const [terms, setTerms] = useState<TermFee[]>(initialTerms);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            setTerms(initialTerms);
        }
    }, [isOpen, initialTerms]);

    const updateMutation = useMutation({
        mutationFn: (newTerms: TermFee[]) => updateFeeRecord(student.id, newTerms),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees'] });
            onClose();
            alert('Fees updated successfully!');
        },
        onError: (err) => {
            console.error('Failed to update fees:', err);
            alert('Failed to update fees');
        }
    });

    const handleTermChange = (index: number, field: keyof TermFee, value: any) => {
        const newTerms = [...terms];
        newTerms[index] = { ...newTerms[index], [field]: value };
        setTerms(newTerms);
    };

    const handleSave = () => {
        updateMutation.mutate(terms);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Fees: ${student.name} (${student.rollNumber})`}>
            <div className="space-y-6">
                {terms.map((term, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
                        <h4 className="text-gray-900 dark:text-white font-bold mb-3">{term.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Status</label>
                                <select
                                    value={term.status}
                                    onChange={(e) => handleTermChange(index, 'status', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Amount (₹)</label>
                                <Input
                                    type="number"
                                    value={term.amount}
                                    onChange={(e) => handleTermChange(index, 'amount', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Due Date</label>
                            <Input
                                type="date"
                                value={term.dueDate}
                                onChange={(e) => handleTermChange(index, 'dueDate', e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
