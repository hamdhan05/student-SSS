import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplaints, resolveComplaint } from '@/lib/api';
import Button from '@/components/UI/Button';

export default function Complaints() {
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: getComplaints,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });

  const handleResolve = (id: string) => {
    if (confirm('Mark this complaint as resolved?')) {
      resolveMutation.mutate(id);
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status === 'pending');
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Student Complaints</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-yellow-600">
          <h3 className="text-sm text-gray-400 mb-2">Pending Complaints</h3>
          <p className="text-3xl font-bold text-yellow-400">{pendingComplaints.length}</p>
        </div>
        <div className="card p-6 border-green-600">
          <h3 className="text-sm text-gray-400 mb-2">Resolved Complaints</h3>
          <p className="text-3xl font-bold text-green-400">{resolvedComplaints.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading complaints...</div>
      ) : (
        <>
          {/* Pending Complaints */}
          {pendingComplaints.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Pending Complaints</h3>
              <div className="space-y-4">
                {pendingComplaints.map((complaint) => (
                  <div key={complaint.id} className="card p-6 border-yellow-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{complaint.title}</h4>
                        <p className="text-sm text-gray-400">
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleResolve(complaint.id)}
                        disabled={resolveMutation.isPending}
                        variant="primary"
                        size="sm"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{complaint.description || complaint.text}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      <em>Submitted anonymously</em>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Complaints */}
          {resolvedComplaints.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Resolved Complaints</h3>
              <div className="space-y-4">
                {resolvedComplaints.map((complaint) => (
                  <div key={complaint.id} className="card p-6 opacity-60">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{complaint.title || complaint.category}</h4>
                        <p className="text-sm text-gray-400">
                          {new Date(complaint.createdAt || complaint.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-900 bg-opacity-50 text-green-400 rounded-full text-xs font-semibold">
                        Resolved
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{complaint.description || complaint.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaints.length === 0 && (
            <div className="card p-8 text-center text-gray-400">No complaints submitted yet</div>
          )}
        </>
      )}
    </div>
  );
}