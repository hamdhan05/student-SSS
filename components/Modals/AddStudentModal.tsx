import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface StudentFormData {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    classId: string;
    section: string;
    rollNumber: string;
    admissionNumber: string;
    academicYear: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    gender: string;
    photo: string;
    emisNumber: string;
    guardianName: string;
    guardianPhone: string;
}

const INITIAL_DATA: StudentFormData = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    classId: '',
    section: '',
    rollNumber: '',
    admissionNumber: '',
    academicYear: '2024-2025',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gender: 'Male', // Default
    photo: '',
    emisNumber: '',
    guardianName: '',
    guardianPhone: '',
};

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<StudentFormData>(INITIAL_DATA);
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Queries
    const { data: classes = [] } = useQuery({
        queryKey: ['db_classes'],
        queryFn: async () => {
            const { getClasses } = await import('@/lib/api');
            return await getClasses();
        },
        enabled: isOpen
    });

    const { data: feeStructures = [] } = useQuery({
        queryKey: ['class_fee_structures', formData.classId],
        queryFn: async () => {
            if (!formData.classId) return [];
            const { data, error } = await supabase
                .from('class_fee_structures')
                .select('*, fee_type:fee_types(name)')
                .eq('class_id', formData.classId)
                .eq('academic_year', formData.academicYear);
            if (error) throw error;
            return data;
        },
        enabled: isOpen && !!formData.classId
    });

    const { data: sports = [] } = useQuery({
        queryKey: ['db_sports'],
        queryFn: async () => {
            const { data, error } = await supabase.from('sports').select('*').order('name');
            if (error) throw error;
            return data;
        },
        enabled: isOpen
    });

    // Mutations
    const addStudentMutation = useMutation({
        mutationFn: async () => {
            // 1. Create Student
            const studentPayload = {
                name: formData.name,
                admission_number: formData.admissionNumber,
                roll_number: formData.rollNumber,
                class_id: formData.classId,
                section: formData.section,
                academic_year: formData.academicYear,
                photo: formData.photo || '/images/students/default.jpg',
                dob: formData.dateOfBirth || null,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                parent_name: formData.parentName,
                parent_phone: formData.parentPhone,
                parent_email: formData.parentEmail,
                guardian_name: formData.guardianName,
                guardian_phone: formData.guardianPhone,
                emis_number: formData.emisNumber
            };

            // Duplicate checks
            const { data: existingEmis } = await supabase
                .from('students')
                .select('id')
                .eq('emis_number', formData.emisNumber)
                .maybeSingle();
            
            if (existingEmis) {
                throw new Error('Student with this EMIS number already exists.');
            }

            const { data: existingAdmission } = await supabase
                .from('students')
                .select('id')
                .eq('admission_number', formData.admissionNumber)
                .maybeSingle();

            if (existingAdmission) {
                throw new Error('Admission number already exists.');
            }

            const { data: newStudent, error: studentError } = await supabase
                .from('students')
                .insert(studentPayload)
                .select()
                .single();

            if (studentError) throw studentError;

            // 2. Create Student Fee Records
            if (feeStructures.length > 0) {
                const feeRecords = feeStructures.map((fs: any) => ({
                    student_id: newStudent.id,
                    fee_type_id: fs.fee_type_id,
                    amount: fs.amount,
                    paid_amount: 0,
                    due_amount: fs.amount,
                    academic_year: formData.academicYear,
                    payment_status: 'pending'
                }));
                const { error: feeError } = await supabase.from('student_fee_records').insert(feeRecords);
                if (feeError) throw feeError;
            }

            // 3. Create Student Sports
            if (selectedSports.length > 0) {
                const sportsToInsert = selectedSports.map(sportId => {
                    const sport = sports.find((s: any) => s.id === sportId);
                    return {
                        student_id: newStudent.id,
                        sport_id: sportId,
                        fee_amount: sport?.fee || 500,
                        paid_amount: 0,
                        status: 'pending'
                    };
                });
                const { error: sportsError } = await supabase.from('student_sports').insert(sportsToInsert);
                if (sportsError) throw sportsError;
            }

            // 4. Initialize Blank Academic Records
            const defaultSubjects = ['Mathematics', 'Science', 'English', 'History', 'Physics'];
            const academicRecordsToInsert = defaultSubjects.map(sub => ({
                student_id: newStudent.id,
                subject: sub,
                marks: null,
                total_marks: 100,
                grade: null,
                term: 'Term 1'
            }));
            const { error: acadError } = await supabase.from('academic_records').insert(academicRecordsToInsert);
            if (acadError) console.error('Academic initialization failed:', acadError);

            // 5. Audit Trail / System Log
            try {
                await supabase.from('system_logs').insert({
                    action: 'Student Added',
                    description: `Student ${formData.name} was added to class ${formData.classId} for ${formData.academicYear}.`,
                });
            } catch (e) {
                console.warn('system_logs insert failed, table might not exist yet.');
            }

            return newStudent;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['all_student_fees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            queryClient.invalidateQueries({ queryKey: ['class_students'] });
            queryClient.invalidateQueries({ queryKey: ['sports_roster'] });
            queryClient.invalidateQueries({ queryKey: ['student_notices'] });
            setSuccessMessage('Student added successfully with fee structures and sports!');
            
            setTimeout(() => {
                setFormData(INITIAL_DATA);
                setSelectedSports([]);
                setSuccessMessage(null);
                onClose();
            }, 1500);
        },
        onError: (err: any) => {
            setFormError(err.message || 'Failed to add student. Please check inputs.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!formData.classId) {
            setFormError('Please select a class.');
            return;
        }
        if (!formData.emisNumber) {
            setFormError('EMIS number is required.');
            return;
        }
        if (!formData.parentName || !formData.parentPhone) {
            setFormError('Parent Name and Parent Phone are required.');
            return;
        }
        if (!formData.dateOfBirth) {
            setFormError('Date of Birth is required.');
            return;
        }
        addStudentMutation.mutate();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSportToggle = (sportId: string) => {
        setSelectedSports(prev => 
            prev.includes(sportId) ? prev.filter(id => id !== sportId) : [...prev, sportId]
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Calculate Totals
    const baseSchoolFees = feeStructures.reduce((sum: number, fs: any) => sum + Number(fs.amount), 0);
    const sportsFees = selectedSports.reduce((sum: number, sportId: string) => {
        const sport = sports.find((s: any) => s.id === sportId);
        return sum + Number(sport?.fee || 0);
    }, 0);
    const totalFees = baseSchoolFees + sportsFees;

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Student (Complete Registration)" size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">

                {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fadeIn">
                        {formError}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm animate-fadeIn">
                        {successMessage}
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <Input label="EMIS Number" name="emisNumber" value={formData.emisNumber} onChange={handleChange} required />
                        <Input label="Admission Number" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required />
                        <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} />
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <Input type="date" label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        <Input type="email" label="Email" name="email" value={formData.email} onChange={handleChange} />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none" />
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} required />
                        
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class / Standard *</label>
                            <select name="classId" value={formData.classId} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none">
                                <option value="">Select Class</option>
                                {classes.map((cls: any) => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <Input label="Section" name="section" value={formData.section} onChange={handleChange} required maxLength={2} />
                    </div>

                    {/* School Fees Preview */}
                    {formData.classId && (
                        <div className="mt-6 p-4 bg-white dark:bg-black/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Applicable School Fees for Selected Class</h4>
                            {feeStructures.length > 0 ? (
                                <div className="space-y-2">
                                    {feeStructures.map((fs: any) => (
                                        <div key={fs.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{fs.fee_type?.name}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹{fs.amount}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-gray-900 dark:text-white">
                                        <span>Total Base Fee</span>
                                        <span>₹{baseSchoolFees}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">No fee structures found for this class.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Parent / Guardian */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Parent / Guardian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Parent Name" name="parentName" value={formData.parentName} onChange={handleChange} required />
                        <Input label="Parent Phone" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required />
                        <Input label="Parent Email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} />
                        <div className="col-span-2 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Guardian Information (Optional)</h4>
                        </div>
                        <Input label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                        <Input label="Guardian Phone" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                    </div>
                </div>

                {/* Sports */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Optional Sports Enrollment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {sports.map((sport: any) => (
                            <label key={sport.id} className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${selectedSports.includes(sport.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                        checked={selectedSports.includes(sport.id)}
                                        onChange={() => handleSportToggle(sport.id)}
                                    />
                                    <span className="font-semibold text-gray-900 dark:text-white">{sport.name}</span>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 pl-6">₹{sport.fee}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Selected Sports Fee:</span>
                        <span className="text-blue-600 dark:text-blue-400 text-lg">₹{sportsFees}</span>
                    </div>
                </div>

                {/* FINAL FEE SUMMARY */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">Final Fee Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-blue-800 dark:text-blue-200">
                            <span>Base School Fees</span>
                            <span>₹{baseSchoolFees}</span>
                        </div>
                        <div className="flex justify-between text-blue-800 dark:text-blue-200">
                            <span>Sports Fees</span>
                            <span>₹{sportsFees}</span>
                        </div>
                        <div className="pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
                            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">TOTAL OVERALL FEE</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{totalFees}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={addStudentMutation.isPending}>
                        {addStudentMutation.isPending ? 'Saving...' : 'Add Student & Configure Fees'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
