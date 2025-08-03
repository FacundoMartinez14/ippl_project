import React, { useState, useEffect } from 'react';
import { MedicalHistory } from '../../services/medicalHistory.service';
import medicalHistoryService from '../../services/medicalHistory.service';
import MedicalHistoryModal from './MedicalHistoryModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MedicalHistoryListProps {
  patientId: string;
  isAdmin?: boolean;
}

const MedicalHistoryList: React.FC<MedicalHistoryListProps> = ({ patientId, isAdmin = false }) => {
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | undefined>();
  const [loading, setLoading] = useState(true);

  const loadHistories = async () => {
    try {
      const data = await medicalHistoryService.getPatientMedicalHistories(patientId);
      setHistories(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error al cargar los historiales médicos:', error);
      toast.error('Error al cargar los historiales médicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistories();
  }, [patientId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro médico?')) {
      try {
        await medicalHistoryService.deleteMedicalHistory(id);
        toast.success('Registro médico eliminado correctamente');
        await loadHistories();
      } catch (error) {
        console.error('Error al eliminar el historial médico:', error);
        toast.error('Error al eliminar el historial médico');
      }
    }
  };

  const handleEdit = (history: MedicalHistory) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedHistory(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando historiales médicos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Historial Médico</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuevo Registro
        </button>
      </div>

      {histories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay registros médicos disponibles.</p>
      ) : (
        <div className="space-y-4">
          {histories.map((history) => (
            <div
              key={history.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(history.date).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <h3 className="font-semibold">Diagnóstico</h3>
                    <p className="text-gray-700">{history.diagnosis}</p>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold">Tratamiento</h3>
                    <p className="text-gray-700">{history.treatment}</p>
                  </div>
                  {history.notes && (
                    <div className="mt-2">
                      <h3 className="font-semibold">Notas Adicionales</h3>
                      <p className="text-gray-700">{history.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(history)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(history.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MedicalHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId}
        selectedHistory={selectedHistory}
        onSave={loadHistories}
      />
    </div>
  );
};

export default MedicalHistoryList; 