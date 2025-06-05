import Modal from './Modal';
import Button from './Button';

function ConfirmModal({ isOpen, onClose, title, message, onConfirm, confirmText = '确定', cancelText = '取消' }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-gray-700 dark:text-gray-300 mb-6">
        <p>{message}</p>
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal; 