import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedicalHistory } from '../services/medicalHistory.service';
import medicalHistoryService from '../services/medicalHistory.service';
import { PencilIcon, TrashIcon, ArrowLeftIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MedicalHistoryModal from '../components/admin/MedicalHistoryModal';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const MedicalHistoryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | undefined>();
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<MedicalHistory | null>(null);

  const loadHistories = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const data = await medicalHistoryService.getPatientMedicalHistories(patientId);
      if (data) {
        setHistories(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
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

  const handleDelete = async (history: MedicalHistory) => {
    setHistoryToDelete(history);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!historyToDelete) return;
    
    try {
      await medicalHistoryService.deleteMedicalHistory(historyToDelete.id);
      toast.success('Registro médico eliminado correctamente');
      await loadHistories();
      setIsDeleteModalOpen(false);
      setHistoryToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el historial médico:', error);
      toast.error('Error al eliminar el historial médico');
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Historial Médico
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona el historial médico del paciente
              </p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Registro
          </button>
        </div>

        {/* Registros médicos */}
        {histories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros médicos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo registro médico para este paciente.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {histories.map((history) => (
              <div
                key={history.id}
                className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(history.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Diagnóstico</h3>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">{history.diagnosis}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tratamiento</h3>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">{history.treatment}</p>
                      </div>
                      {history.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Notas Adicionales</h3>
                          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{history.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(history)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(history)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
              Confirmar Eliminación
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar este registro médico? Esta acción no se puede deshacer.
              </p>
              {historyToDelete && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Fecha:</span>{' '}
                    {new Date(historyToDelete.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Diagnóstico:</span>{' '}
                    {historyToDelete.diagnosis}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={confirmDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <MedicalHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId || ''}
        selectedHistory={selectedHistory}
        onSave={loadHistories}
      />
    </div>
  );
};

export default MedicalHistoryPage; 