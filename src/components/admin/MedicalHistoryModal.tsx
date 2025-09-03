import React, { useState, useEffect } from 'react';
import { MedicalHistory } from '../../services/medicalHistory.service';
import medicalHistoryService from '../../services/medicalHistory.service';
import toast from 'react-hot-toast';

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSave?: () => void;
  selectedHistory?: MedicalHistory;
}

const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSave,
  selectedHistory
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedHistory) {
      setFormData({
        date: selectedHistory.date.split('T')[0],
        diagnosis: selectedHistory.diagnosis,
        treatment: selectedHistory.treatment,
        notes: selectedHistory.notes
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        notes: ''
      });
    }
  }, [selectedHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedHistory) {
        await medicalHistoryService.updateMedicalHistory(selectedHistory.id, formData);
        toast.success('Historial médico actualizado correctamente');
      } else {
        await medicalHistoryService.createMedicalHistory({
          patientId,
          ...formData
        });
        toast.success('Historial médico creado correctamente');
      }
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error al guardar el historial médico:', error);
      toast.error('Error al guardar el historial médico');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex-1 mr-3">
            {selectedHistory ? 'Editar Historial Médico' : 'Nuevo Registro Médico'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 flex-shrink-0"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
            <textarea
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : selectedHistory ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalHistoryModal; 