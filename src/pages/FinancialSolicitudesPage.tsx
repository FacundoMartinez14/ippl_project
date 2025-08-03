import React, { useEffect, useState } from 'react';
import patientsService, { Patient } from '../services/patients.service';
import frequencyRequestService, { FrequencyRequest } from '../services/frequencyRequest.service';
import statusRequestService from '../services/statusRequest.service';
import { StatusRequest } from '../types/StatusRequest';
import { AdjustmentsHorizontalIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const FinancialSolicitudesPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [frequencyRequests, setFrequencyRequests] = useState<FrequencyRequest[]>([]);
  const [statusRequests, setStatusRequests] = useState<StatusRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'frequency' | 'inactive' | 'alta' | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const data = await patientsService.getAllPatients();
    setPatients(data);
    setLoading(false);
  };

  const handleViewFrequencyRequests = async (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType('frequency');
    setShowModal(true);
    const requests = await frequencyRequestService.getPatientRequests(patient.id);
    setFrequencyRequests(requests);
  };

  const handleViewStatusRequests = async (patient: Patient, type: 'inactive' | 'alta') => {
    setSelectedPatient(patient);
    setModalType(type);
    setShowModal(true);
    const requests = await statusRequestService.getPendingRequests();
    // Filtrar por paciente y tipo de solicitud
    const filtered = requests.filter(r => r.patientId === patient.id && (
      (type === 'inactive' && r.requestedStatus === 'inactive') ||
      (type === 'alta' && r.requestedStatus === 'absent')
    ));
    setStatusRequests(filtered);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Solicitudes de Pacientes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-xl shadow">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <th className="px-6 py-3 text-left text-lg font-semibold rounded-tl-xl">Nombre</th>
              <th className="px-6 py-3 text-left text-lg font-semibold">Estado</th>
              <th className="px-6 py-3 text-center text-lg font-semibold rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-6">Cargando...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-6">No hay pacientes registrados</td></tr>
            ) : patients.map((patient, idx) => (
              <tr key={patient.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">{patient.name}</td>
                <td className="px-6 py-4 text-gray-700 whitespace-nowrap capitalize text-base">{patient.status}</td>
                <td className="px-6 py-4 flex gap-4 items-center justify-center">
                  <button
                    className="group p-2 rounded-full hover:bg-blue-100 transition"
                    title="Ver Solicitud de Frecuencia"
                    onClick={() => handleViewFrequencyRequests(patient)}
                  >
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600 group-hover:text-blue-800" />
                  </button>
                  <button
                    className="group p-2 rounded-full hover:bg-yellow-100 transition"
                    title="Ver Solicitud Inactivo"
                    onClick={() => handleViewStatusRequests(patient, 'inactive')}
                  >
                    <XCircleIcon className="h-6 w-6 text-yellow-500 group-hover:text-yellow-700" />
                  </button>
                  <button
                    className="group p-2 rounded-full hover:bg-green-100 transition"
                    title="Ver Solicitud Alta"
                    onClick={() => handleViewStatusRequests(patient, 'alta')}
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-600 group-hover:text-green-800" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para mostrar solicitudes */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Solicitudes de {selectedPatient.name}</h2>
            {modalType === 'frequency' && (
              <div>
                <h3 className="font-semibold mb-2">Solicitudes de Cambio de Frecuencia</h3>
                {frequencyRequests.length === 0 ? (
                  <p>No hay solicitudes de cambio de frecuencia.</p>
                ) : (
                  <ul className="space-y-2">
                    {frequencyRequests.map(req => (
                      <li key={req.id} className="border p-2 rounded">
                        <div><b>Solicitado:</b> {req.currentFrequency} → {req.requestedFrequency}</div>
                        <div><b>Motivo:</b> {req.reason}</div>
                        <div><b>Estado:</b> {req.status}</div>
                        <div><b>Fecha:</b> {new Date(req.createdAt).toLocaleString('es-ES')}</div>
                        {req.adminResponse && <div><b>Respuesta Admin:</b> {req.adminResponse}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {modalType !== 'frequency' && (
              <div>
                <h3 className="font-semibold mb-2">Solicitudes de Cambio de Estado</h3>
                {statusRequests.length === 0 ? (
                  <p>No hay solicitudes de este tipo.</p>
                ) : (
                  <ul className="space-y-2">
                    {statusRequests.map(req => (
                      <li key={req.id} className="border p-2 rounded">
                        <div><b>Estado Actual:</b> {req.currentStatus}</div>
                        <div><b>Solicitado:</b> {req.requestedStatus}</div>
                        <div><b>Motivo:</b> {req.reason}</div>
                        <div><b>Estado Solicitud:</b> {req.status}</div>
                        <div><b>Fecha:</b> {new Date(req.createdAt).toLocaleString('es-ES')}</div>
                        {req.adminResponse && <div><b>Respuesta Admin:</b> {req.adminResponse}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSolicitudesPage; 