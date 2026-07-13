// components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-neutral-100 shadow-2xl max-w-md w-full p-8 relative mx-4 transition-all transform scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black hover:bg-neutral-100/50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer font-bold text-sm"
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
