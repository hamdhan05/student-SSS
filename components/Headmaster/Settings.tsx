import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSports, getAcademicComponents, createSport, createAcademicComponent } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

export default function Settings() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'sports' | 'academics'>('sports');

    const [newSportName, setNewSportName] = useState('');
    const [newSportFee, setNewSportFee] = useState('');

    const [newComponentName, setNewComponentName] = useState('');

    const { data: sports = [], isLoading: loadingSports } = useQuery({
        queryKey: ['sports'],
        queryFn: getSports
    });

    const { data: components = [], isLoading: loadingComponents } = useQuery({
        queryKey: ['academic_components'],
        queryFn: getAcademicComponents
    });

    const addSportMutation = useMutation({
        mutationFn: async ({ name, fee }: { name: string, fee: number }) => createSport(name, fee),
        onSuccess: () => {
            setNewSportName('');
            setNewSportFee('');
            queryClient.invalidateQueries({ queryKey: ['sports'] });
            alert('Sport added successfully!');
        }
    });

    const addComponentMutation = useMutation({
        mutationFn: async ({ name }: { name: string }) => createAcademicComponent(name),
        onSuccess: () => {
            setNewComponentName('');
            queryClient.invalidateQueries({ queryKey: ['academic_components'] });
            alert('Component added successfully!');
        }
    });

    const handleAddSport = () => {
        if (!newSportName.trim() || isNaN(Number(newSportFee)) || Number(newSportFee) < 0) {
            alert('Invalid sport details');
            return;
        }
        addSportMutation.mutate({ name: newSportName, fee: Number(newSportFee) });
    };

    const handleAddComponent = () => {
        if (!newComponentName.trim()) {
            alert('Invalid component name');
            return;
        }
        addComponentMutation.mutate({ name: newComponentName });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-600 dark:text-white">System Settings</h2>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`pb-2 px-4 text-sm font-medium ${activeTab === 'sports' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('sports')}
                >
                    Sports Management
                </button>
                <button
                    className={`pb-2 px-4 text-sm font-medium ${activeTab === 'academics' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('academics')}
                >
                    Academic Components
                </button>
            </div>

            {activeTab === 'sports' && (
                <div className="card p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New Sport</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sport Name</label>
                                <Input value={newSportName} onChange={(e) => setNewSportName(e.target.value)} placeholder="e.g. Archery" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Fee (₹)</label>
                                <Input type="number" value={newSportFee} onChange={(e) => setNewSportFee(e.target.value)} placeholder="500" />
                            </div>
                            <Button onClick={handleAddSport} disabled={addSportMutation.isPending}>
                                {addSportMutation.isPending ? 'Adding...' : 'Add Sport'}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Available Sports</h3>
                        {loadingSports ? (
                            <div className="text-gray-500">Loading sports...</div>
                        ) : sports.length === 0 ? (
                            <div className="text-gray-500">No sports added yet.</div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-black/30">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Sport Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Annual Fee (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                                        {sports.map((sport: any) => (
                                            <tr key={sport.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <td className="px-6 py-4 text-sm text-gray-500">{sport.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{sport.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">₹{sport.fee}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'academics' && (
                <div className="card p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add Academic Component</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component Name</label>
                                <Input value={newComponentName} onChange={(e) => setNewComponentName(e.target.value)} placeholder="e.g. Extra Marks, IECD" />
                            </div>
                            <Button onClick={handleAddComponent} disabled={addComponentMutation.isPending}>
                                {addComponentMutation.isPending ? 'Adding...' : 'Add Component'}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Available Components</h3>
                        {loadingComponents ? (
                            <div className="text-gray-500">Loading components...</div>
                        ) : components.length === 0 ? (
                            <div className="text-gray-500">No components added yet.</div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-black/30">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Component Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                                        {components.map((component: any) => (
                                            <tr key={component.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <td className="px-6 py-4 text-sm text-gray-500">{component.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{component.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
