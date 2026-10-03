import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';


// Interfaces
interface ClassData {
    id: string;
    name: string;
}

interface FeeType {
    id: string;
    name: string;
}

interface FeeStructureItem {
    id?: string;
    fee_type_id: string;
    category_name: string;
    amount: number;
    frequency: string;
    description: string;
}

const FREQUENCY_MULTIPLIERS: Record<string, number> = {
    'One Time': 1,
    'Monthly': 12,
    'Quarterly': 4,
    'Half Yearly': 2,
    'Annually': 1,
};

export default function FeeStructure() {
    const queryClient = useQueryClient();
    const currentAcademicYear = '2024-2025';

    // State
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [editedStructure, setEditedStructure] = useState<FeeStructureItem[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    
    // Unsaved Changes Modal State
    const [pendingClassId, setPendingClassId] = useState<string | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Copy Modal State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyFromClassId, setCopyFromClassId] = useState<string>('');

    // --- Data Fetching ---
    const { data: classesData, isLoading: loadingClasses } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const { data, error } = await supabase.from('classes').select('*');
            if (error) throw error;
            return data as ClassData[];
        }
    });

    const classes = useMemo(() => {
        if (!classesData) return [];
        return [...classesData].sort((a, b) => {
            // Sort Pre-KG, LKG, UKG first, then numbers
            const order: Record<string, number> = { 'Pre-KG': 1, 'LKG': 2, 'UKG': 3 };
            const aOrder = order[a.name];
            const bOrder = order[b.name];
            
            if (aOrder && bOrder) return aOrder - bOrder;
            if (aOrder) return -1;
            if (bOrder) return 1;
            
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [classesData]);

    const { data: feeTypesData, isLoading: loadingFeeTypes } = useQuery({
        queryKey: ['feeTypes'],
        queryFn: async () => {
            const { data, error } = await supabase.from('fee_types').select('*');
            if (error) throw error;
            return data as FeeType[];
        }
    });
    const feeTypes = feeTypesData || [];

    // Auto-select first class
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    const { data: dbStructure, isLoading: loadingStructure, error: structureError, isError: isStructureError } = useQuery({
        queryKey: ['feeStructure', selectedClassId, currentAcademicYear],
        queryFn: async () => {
            if (!selectedClassId) return [];
            const { data, error } = await supabase
                .from('class_fee_structures')
                .select(`
                    id, amount, frequency, description, fee_type_id,
                    fee_types(name)
                `)
                .eq('class_id', selectedClassId)
                .eq('academic_year', currentAcademicYear);
            
            if (error) {
                console.error('Error fetching fee structure:', error);
                throw error;
            }
            
            return data.map((item: any) => ({
                id: item.id,
                fee_type_id: item.fee_type_id,
                category_name: item.fee_types?.name || '',
                amount: item.amount,
                frequency: item.frequency || 'Annually',
                description: item.description || ''
            })) as FeeStructureItem[];
        },
        enabled: !!selectedClassId,
        retry: false
    });

    // Sync dbStructure to editable state
    useEffect(() => {
        if (dbStructure) {
            setEditedStructure(JSON.parse(JSON.stringify(dbStructure)));
            setIsDirty(false);
        }
    }, [dbStructure, selectedClassId]);

    // --- KPIs ---
    const { data: kpiData } = useQuery({
        queryKey: ['feeStructureKPIs'],
        queryFn: async () => {
            // Count unique classes with fee structures
            const { data: activeClasses, error: err1 } = await supabase
                .from('class_fee_structures')
                .select('class_id')
                .eq('academic_year', currentAcademicYear);
            
            // Total fee types
            const { count: typeCount, error: err2 } = await supabase
                .from('fee_types')
                .select('*', { count: 'exact', head: true });

            if (err1 || err2) throw err1 || err2;

            const uniqueClasses = new Set(activeClasses?.map(c => c.class_id)).size;
            return { uniqueClasses, totalFeeTypes: typeCount || 0 };
        }
    });

    // --- Derived State ---
    const selectedClass = classes.find(c => c.id === selectedClassId);

    const calculateTotalAnnual = (structure: FeeStructureItem[]) => {
        return structure.reduce((total, item) => {
            const multi = FREQUENCY_MULTIPLIERS[item.frequency] || 1;
            return total + (Number(item.amount) * multi);
        }, 0);
    };

    const totalAnnualFee = useMemo(() => calculateTotalAnnual(editedStructure), [editedStructure]);

    // --- Actions ---
    const handleClassSelect = (newId: string) => {
        if (newId === selectedClassId) return;
        if (isDirty) {
            setPendingClassId(newId);
            setShowUnsavedModal(true);
        } else {
            setSelectedClassId(newId);
        }
    };

    const confirmClassChange = () => {
        if (pendingClassId) {
            setSelectedClassId(pendingClassId);
            setPendingClassId(null);
        }
        setShowUnsavedModal(false);
    };

    const cancelClassChange = () => {
        setPendingClassId(null);
        setShowUnsavedModal(false);
    };

    const handleFieldChange = (index: number, field: keyof FeeStructureItem, value: any) => {
        const newStruct = [...editedStructure];
        newStruct[index] = { ...newStruct[index], [field]: value };
        
        // If category changed, check if it matches existing type
        if (field === 'category_name') {
            const existingType = feeTypes.find(f => f.name.toLowerCase() === value.toLowerCase());
            newStruct[index].fee_type_id = existingType ? existingType.id : '';
        }

        setEditedStructure(newStruct);
        setIsDirty(true);
    };

    const addRow = () => {
        setEditedStructure([
            ...editedStructure, 
            { fee_type_id: '', category_name: '', amount: 0, frequency: 'Annually', description: '' }
        ]);
        setIsDirty(true);
    };

    const deleteRow = (index: number) => {
        const newStruct = [...editedStructure];
        newStruct.splice(index, 1);
        setEditedStructure(newStruct);
        setIsDirty(true);
    };

    const resetChanges = () => {
        setEditedStructure(JSON.parse(JSON.stringify(dbStructure)));
        setIsDirty(false);
    };

    // --- Saving ---
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!selectedClassId) throw new Error("No class selected");

            // 1. Validate
            for (const item of editedStructure) {
                if (!item.category_name.trim()) throw new Error("Fee category name cannot be empty");
                if (item.amount < 0) throw new Error("Amount cannot be negative");
                if (!item.frequency) throw new Error("Frequency is required");
            }
            // Check dupes
            const catNames = editedStructure.map(i => i.category_name.toLowerCase().trim());
            if (new Set(catNames).size !== catNames.length) {
                throw new Error("Duplicate fee categories are not allowed");
            }

            // 2. Resolve fee_type_ids for new categories
            const finalStructure = [];
            for (const item of editedStructure) {
                let typeId = item.fee_type_id;
                
                // If it's a new category (no ID match), insert it into fee_types
                if (!typeId) {
                    const { data: existingTypes } = await supabase.from('fee_types').select('id').ilike('name', item.category_name);
                    
                    if (existingTypes && existingTypes.length > 0) {
                        typeId = existingTypes[0].id;
                    } else {
                        const { data: newType, error: typeErr } = await supabase
                            .from('fee_types')
                            .insert({ name: item.category_name, description: item.description })
                            .select()
                            .single();
                        if (typeErr) throw typeErr;
                        typeId = newType.id;
                    }
                }
                finalStructure.push({
                    class_id: selectedClassId,
                    fee_type_id: typeId,
                    amount: Number(item.amount),
                    frequency: item.frequency,
                    description: item.description,
                    academic_year: currentAcademicYear
                });
            }

            // 3. Upsert / Replace for this class & year
            // Since we don't know exactly what was deleted, easiest is to delete all for this class/year and insert fresh
            const { error: delErr } = await supabase
                .from('class_fee_structures')
                .delete()
                .eq('class_id', selectedClassId)
                .eq('academic_year', currentAcademicYear);
            
            if (delErr) throw delErr;

            if (finalStructure.length > 0) {
                const { error: insErr } = await supabase
                    .from('class_fee_structures')
                    .insert(finalStructure);
                if (insErr) throw insErr;
            }
        },
        onSuccess: () => {
            alert("Fee structure updated successfully.");
            queryClient.invalidateQueries({ queryKey: ['feeStructure'] });
            queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
            queryClient.invalidateQueries({ queryKey: ['feeStructureKPIs'] });
            setIsDirty(false);
        },
        onError: (err: any) => {
            alert(err.message || "Unable to update fee structure. Please try again.");
        }
    });

    // --- Copy Functionality ---
    const handleCopy = async () => {
        if (!copyFromClassId || copyFromClassId === selectedClassId) {
            alert("Please select a valid class to copy from.");
            return;
        }
        
        // Fetch source class structure
        const { data, error } = await supabase
            .from('class_fee_structures')
            .select(`amount, frequency, description, fee_type_id, fee_types(name)`)
            .eq('class_id', copyFromClassId)
            .eq('academic_year', currentAcademicYear);
            
        if (error) {
            alert("Error fetching source structure.");
            return;
        }

        const copied = data.map((item: any) => ({
            fee_type_id: item.fee_type_id,
            category_name: item.fee_types?.name || '',
            amount: item.amount,
            frequency: item.frequency || 'Annually',
            description: item.description || ''
        }));

        setEditedStructure(copied);
        setIsDirty(true);
        setShowCopyModal(false);
        alert("Structure copied! Remember to save changes.");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Structure</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Set and manage fee structure for each class. Changes are saved automatically to the database.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Fee Structure
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">TOTAL CLASSES</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{kpiData?.uniqueClasses || 0}</h3>
                            <p className="text-xs text-slate-500 mt-1">Classes with fee structure</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">TOTAL FEE TYPES</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{kpiData?.totalFeeTypes || 0}</h3>
                            <p className="text-xs text-slate-500 mt-1">Different fee categories</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <span className="text-xl font-bold">₹</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">AVERAGE ANNUAL FEE</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">₹42,500</h3>
                            <p className="text-xs text-slate-500 mt-1">Across all classes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">LAST UPDATED</p>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Oct 03, 2026</h3>
                            <p className="text-xs text-slate-500 mt-1">by Headmaster Admin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Class Selector */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm h-full">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Select Class</h3>
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search class..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        
                        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleClassSelect(cls.id)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        selectedClassId === cls.id 
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    Class {cls.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Fee Editor */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm h-full min-h-[600px]">
                        {loadingStructure ? (
                            <div className="flex items-center justify-center h-full flex-1">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : isStructureError ? (
                            <div className="flex items-center justify-center h-full flex-1 p-8 text-center">
                                <div className="max-w-md">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Database Error</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Unable to load fee structure. It looks like the database migration has not been run. Please run the script <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">02_add_frequency_to_fee_structure.sql</code> in your Supabase SQL editor.
                                    </p>
                                    <p className="text-xs text-red-500 font-mono text-left bg-red-50 dark:bg-red-900/10 p-3 rounded-lg overflow-x-auto">
                                        {structureError?.message || 'Unknown error'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fee Structure - Class {selectedClass?.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">Update the fee amounts for different categories. Changes are saved to the database.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setShowCopyModal(true)}
                                        className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                        Copy from Another Class
                                    </button>
                                </div>

                                {/* Table */}
                                <div className="p-6 flex-1 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-3 font-semibold">FEE CATEGORY</th>
                                                <th className="pb-3 font-semibold">AMOUNT (₹)</th>
                                                <th className="pb-3 font-semibold">FREQUENCY</th>
                                                <th className="pb-3 font-semibold">DESCRIPTION</th>
                                                <th className="pb-3 font-semibold text-center w-16">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {editedStructure.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                        No fee categories defined for this class. Click "Add New Fee Category" below.
                                                    </td>
                                                </tr>
                                            ) : null}
                                            {editedStructure.map((item, index) => (
                                                <tr key={index} className="group">
                                                    <td className="py-4 pr-4">
                                                        <input 
                                                            type="text" 
                                                            value={item.category_name}
                                                            onChange={(e) => handleFieldChange(index, 'category_name', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="e.g. Tuition Fee"
                                                        />
                                                    </td>
                                                    <td className="py-4 pr-4 w-32">
                                                        <input 
                                                            type="number" 
                                                            value={item.amount}
                                                            onChange={(e) => handleFieldChange(index, 'amount', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="py-4 pr-4 w-40">
                                                        <select 
                                                            value={item.frequency}
                                                            onChange={(e) => handleFieldChange(index, 'frequency', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                                        >
                                                            <option>One Time</option>
                                                            <option>Monthly</option>
                                                            <option>Quarterly</option>
                                                            <option>Half Yearly</option>
                                                            <option>Annually</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 pr-4 min-w-[200px]">
                                                        <input 
                                                            type="text" 
                                                            value={item.description}
                                                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-500 dark:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="Fee description..."
                                                        />
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => deleteRow(index)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button 
                                        type="button"
                                        onClick={addRow}
                                        className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add New Fee Category
                                    </button>
                                </div>

                                {/* Footer & Totals */}
                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total Annual Fee (Estimated)</span>
                                        <span className="text-xl font-bold text-blue-700 dark:text-blue-400 ml-2">₹ {totalAnnualFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" onClick={resetChanges} disabled={!isDirty || saveMutation.isPending}>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            Reset
                                        </Button>
                                        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isDirty}>
                                            {saveMutation.isPending ? 'Saving...' : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <Modal
                isOpen={showUnsavedModal}
                onClose={cancelClassChange}
                title="Unsaved Changes"
            >
                <div className="p-4 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                You have unsaved changes. Do you want to discard them?
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" onClick={cancelClassChange}>Cancel</Button>
                        <Button variant="danger" onClick={confirmClassChange}>Discard Changes</Button>
                    </div>
                </div>
            </Modal>

            {/* Copy Structure Modal */}
            <Modal
                isOpen={showCopyModal}
                onClose={() => setShowCopyModal(false)}
                title="Copy Fee Structure"
            >
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Copy fee structure from:
                        </label>
                        <select 
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                            value={copyFromClassId}
                            onChange={(e) => setCopyFromClassId(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id} disabled={c.id === selectedClassId}>
                                    Class {c.name} {c.id === selectedClassId ? '(Current)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">
                            To: <span className="font-semibold text-slate-800 dark:text-white">Class {selectedClass?.name}</span>
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" onClick={() => setShowCopyModal(false)}>Cancel</Button>
                        <Button onClick={handleCopy} disabled={!copyFromClassId}>Copy Structure</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
