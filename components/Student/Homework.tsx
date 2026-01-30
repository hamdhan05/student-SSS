import { useQuery } from '@tanstack/react-query';
import { getHomework } from '@/lib/api';

interface StudentHomeworkProps {
    student: {
        class: string;
        section: string;
        id: string; // Not strictly needed for query but good for types
    };
}

export default function StudentHomework({ student }: StudentHomeworkProps) {
    const { data: homeworkList = [], isLoading } = useQuery({
        queryKey: ['homework', student.class, student.section],
        queryFn: () => getHomework({ classId: student.class, section: student.section }),
        enabled: !!student.class && !!student.section,
    });

    if (isLoading) {
        return <div className="text-gray-600 dark:text-white text-center p-8">Loading homework...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-600 dark:text-white">My Homework</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeworkList.map((hw: any) => (
                    <div key={hw.id} className="card p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-sm dark:shadow-none">
                        <div className="flex justify-between items-start mb-4">
                            <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 text-xs font-bold uppercase group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30">
                                {hw.subject}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors">
                                Due: {new Date(hw.dueDate).toLocaleDateString()}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-600 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                            {hw.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {hw.description}
                        </p>

                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                            <span>Assigned by: {hw.createdBy === 't1' ? 'Teacher' : hw.createdBy}</span>
                            <span>{new Date(hw.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}

                {homeworkList.length === 0 && (
                    <div className="col-span-full card p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10">
                        <span className="text-4xl mb-4">🎉</span>
                        <p className="text-xl font-medium text-gray-600 dark:text-white">No homework assigned!</p>
                        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Enjoy your free time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
