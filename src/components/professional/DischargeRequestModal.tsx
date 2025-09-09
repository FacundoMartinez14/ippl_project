import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface DischargeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onRequestSent: () => void;
}

const DischargeRequestModal: React.FC<DischargeRequestModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onRequestSent
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Por favor, ingresa el motivo de la baja');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/api/patients/${patientId}/request-discharge`, {
        reason
      });
      
      toast.success('Solicitud de baja enviada correctamente');
      onRequestSent();
      onClose();
    } catch (error) {
      console.error('Error al enviar solicitud de baja:', error);
      toast.error('Error al enviar la solicitud de baja');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Solicitar Baja de Paciente</h2>
        <p className="text-gray-600 mb-4">
          Estás por solicitar la baja del paciente <span className="font-medium">{patientName}</span>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la baja
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Explica el motivo de la solicitud de baja..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DischargeRequestModal; 