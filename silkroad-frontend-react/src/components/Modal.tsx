import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 rounded px-4 py-1"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
