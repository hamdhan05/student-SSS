import { useState } from 'react';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';

interface AttendanceBatchControlsProps {
  studentIds: string[];
  date: Date;
  onBatchUpdate: (studentIds: string[], status: 'present' | 'absent' | 'late') => void;
}

export default function AttendanceBatchControls({
  studentIds,
  date,
  onBatchUpdate,
}: AttendanceBatchControlsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'late'>('present');

  const handleBatchUpdate = (status: 'present' | 'absent' | 'late') => {
    setSelectedStatus(status);
    setShowModal(true);
  };

  const confirmBatchUpdate = () => {
    onBatchUpdate(studentIds, selectedStatus);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Batch Actions</h4>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleBatchUpdate('present')}
            variant="success"
            size="sm"
          >
            Mark All Present
          </Button>
          <Button
            onClick={() => handleBatchUpdate('absent')}
            variant="danger"
            size="sm"
          >
            Mark All Absent
          </Button>
          <Button
            onClick={() => handleBatchUpdate('late')}
            variant="warning"
            size="sm"
          >
            Mark All Late
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Batch Update"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to mark all {studentIds.length} students as{' '}
            <strong>{selectedStatus}</strong> for {date.toLocaleDateString()}?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBatchUpdate}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
