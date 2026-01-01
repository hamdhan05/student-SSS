import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/lib/api';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';

export default function Notices() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const handleOpenModal = (notice?: any) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({ title: notice.title, content: notice.content });
    } else {
      setEditingNotice(null);
      setFormData({ title: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
    setFormData({ title: '', content: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noticeData = {
      ...formData,
      date: new Date().toISOString().split('T')[0],
      createdBy: 'Headmaster',
    };
    if (editingNotice) {
      updateMutation.mutate({ id: editingNotice.id, data: noticeData });
    } else {
      createMutation.mutate(noticeData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notice Board</h2>
        <Button onClick={() => handleOpenModal()} className="!bg-gray-900 !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-200">
          Create Notice
        </Button>
      </div>

      {isLoading ? (
        <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">Loading notices...</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{notice.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(notice.createdAt || notice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(notice)}
                    className="px-3 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 dark:bg-white dark:text-black text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 dark:bg-white dark:text-black text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notice.content}</p>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
              No notices posted yet. Create your first notice!
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNotice ? 'Edit Notice' : 'Create Notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter notice title"
              required
              className="bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter notice content"
              required
              rows={6}
              className="w-full px-4 py-2 rounded bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="!bg-gray-900 !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-200"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingNotice
                  ? 'Update'
                  : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}