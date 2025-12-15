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
                    <div key={index} className="bg-white bg-opacity-5 p-4 rounded border border-gray-700">
                        <h4 className="text-white font-bold mb-3">{term.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Status</label>
                                <select
                                    value={term.status}
                                    onChange={(e) => handleTermChange(index, 'status', e.target.value)}
                                    className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-white text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Amount (₹)</label>
                                <Input
                                    type="number"
                                    value={term.amount}
                                    onChange={(e) => handleTermChange(index, 'amount', Number(e.target.value))}
                                    className="bg-black border-gray-600 text-white text-sm py-2"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-gray-400 text-sm mb-1">Due Date</label>
                            <Input
                                type="date"
                                value={term.dueDate}
                                onChange={(e) => handleTermChange(index, 'dueDate', e.target.value)}
                                className="bg-black border-gray-600 text-white text-sm py-2"
                            />
                        </div>
                    </div>
                ))}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
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
