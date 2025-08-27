import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, message }) => (
    <div className="fixed inset-0 bg-black/90 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
                <div className="flex justify-center mb-4"><AlertTriangle className="w-12 h-12 text-red-500" /></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Você tem certeza?</h3>
                <p className="text-gray-600 text-sm mb-6">{message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700">Excluir</button>
            </div>
        </div>
    </div>
);

export default ConfirmationModal;
