import React, { useState, useEffect, useRef } from 'react';
import { UserIcon, MicrophoneIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import patientsService, { Patient, AssignPatientDTO, CreatePatientDTO } from '../../services/patients.service';
import toast from 'react-hot-toast';
import appointmentsService from '../../services/appointments.service';

interface Professional {
  id: string;
  name: string;
}

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: AssignPatientDTO) => Promise<void>;
  patient: Patient | null;
  professionals: Professional[];
}

const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, onAssign, patient, professionals }) => {
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [status, setStatus] = useState<'active' | 'pending'>('active');
  const [nextAppointment, setNextAppointment] = useState('');
  const [nextAppointmentTime, setNextAppointmentTime] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [noteType, setNoteType] = useState<'text' | 'audio'>('text');
  const [textNote, setTextNote] = useState('');
  const [sessionCost, setSessionCost] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const commissionPercentage = 20; // 20% de comisión por defecto

  const calculateCommission = (cost: number) => {
    return (cost * commissionPercentage) / 100;
  };

  const handleSessionCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = parseFloat(e.target.value);
    setSessionCost(cost);
    setCommission(calculateCommission(cost));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'  // Usar WebM que es más compatible
      });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        // Crear un blob con formato WebM
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      toast.error('Error al iniciar la grabación');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      // Detener todos los tracks del stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Limpiar URL al cerrar o eliminar
  const cleanupAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedProf = professionals.find(p => p.id === selectedProfessional);
      if (!selectedProf) {
      toast.error('Por favor selecciona un profesional');
      return;
    }

      let audioNoteUrl = '';
      if (noteType === 'audio' && audioBlob) {
        try {
          const audioFile = new File([audioBlob], 'note.webm', { 
            type: 'audio/webm'
          });
          audioNoteUrl = await patientsService.uploadAudio(audioFile);
        } catch (error) {
          console.error('Error al subir el audio:', error);
          toast.error('Error al subir el audio');
          return;
        }
      }

      const assignData = {
        patientId: patient.id,
        professionalId: selectedProfessional,
        professionalName: selectedProf.name,
        status,
        nextAppointment,
        textNote: textNote.trim() || undefined,
        audioNote: audioNoteUrl || undefined,
        sessionCost,
        commission
      };

      await onAssign(assignData);

      // Si se estableció una próxima cita, crearla en el calendario
      if (nextAppointment && nextAppointmentTime) {
        try {
          const appointmentData = {
            patientId: patient.id,
            professionalId: selectedProfessional,
            date: nextAppointment,
            startTime: nextAppointmentTime,
            endTime: new Date(new Date(`${nextAppointment}T${nextAppointmentTime}`).getTime() + 60 * 60 * 1000)
              .toTimeString()
              .split(':')
              .slice(0, 2)
              .join(':'),
            type: 'regular' as const,
            notes: textNote.trim() || undefined,
            audioNote: audioNoteUrl || undefined,
            sessionCost,
            commission
          };

          await appointmentsService.createAppointment(appointmentData);
          toast.success('Cita agendada correctamente');
        } catch (error) {
          console.error('Error al crear la cita:', error);
          toast.error('Error al agendar la cita, pero el paciente fue asignado correctamente');
        }
      }

      cleanupAudio();
      setSelectedProfessional('');
      setStatus('active');
      setNextAppointment('');
      setNextAppointmentTime('');
      setTextNote('');
      setNoteType('text');
      setSessionCost(0);
      setCommission(0);
      onClose();
      toast.success('Paciente asignado exitosamente');
    } catch (error) {
      console.error('Error al asignar paciente:', error);
      toast.error('Error al asignar el paciente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Asignar Profesional a {patient?.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profesional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar profesional</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'pending')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Próxima Cita
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="time"
                value={nextAppointmentTime}
                onChange={(e) => setNextAppointmentTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="09:00"
                max="17:00"
                step="3600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Nota
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setNoteType('text')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  noteType === 'text'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nota de Texto
              </button>
              <button
                type="button"
                onClick={() => setNoteType('audio')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  noteType === 'audio'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nota de Voz
              </button>
            </div>
          </div>

          {noteType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nota de Texto
              </label>
              <textarea
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Escribe una nota sobre el paciente..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nota de Audio
              </label>
              {!audioBlob ? (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    isRecording
                      ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                  }`}
                >
                  <MicrophoneIcon className="h-5 w-5 mr-2" />
                  {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md">
                    <span className="text-sm text-gray-600">Audio grabado</span>
                    <button
                      type="button"
                      onClick={cleanupAudio}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                  {audioUrl && (
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full mt-2"
                      preload="metadata"
                    >
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Costo de la Sesión ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sessionCost}
              onChange={handleSessionCostChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comisión ({commissionPercentage}%)
            </label>
            <input
              type="number"
              value={commission}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              disabled
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreatePatientDTO) => Promise<void>;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd({ name, description });
      setName('');
      setDescription('');
      onClose();
      toast.success('Paciente agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar paciente:', error);
      toast.error('Error al agregar el paciente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Agregar Nuevo Paciente
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Paciente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="Información adicional del paciente..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const patientsData = await patientsService.getAllPatients();
      setPatients(patientsData);
      
      // Cargar profesionales desde el archivo users.json
      setProfessionals([
        { id: '3', name: 'Dr. Juan Pérez' },
        { id: '4', name: 'Dra. María García' }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (assignData: AssignPatientDTO) => {
    try {
      const updatedPatient = await patientsService.assignPatient(assignData);
      setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setIsAssignModalOpen(false);
      setSelectedPatient(null);
      toast.success('Paciente asignado correctamente');
    } catch (error) {
      console.error('Error al asignar paciente:', error);
      toast.error('Error al asignar el paciente');
    }
  };

  const openAssignModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAssignModalOpen(true);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPatient = await patientsService.addPatient({ name, description });
      setPatients([...patients, newPatient]);
      setName('');
      setDescription('');
      setIsNewPatientModalOpen(false);
      toast.success('Paciente agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar paciente:', error);
      toast.error('Error al agregar el paciente');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
      try {
        await patientsService.deletePatient(patientId);
        setPatients(patients.filter(p => p.id !== patientId));
        toast.success('Paciente eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar paciente:', error);
        toast.error('Error al eliminar el paciente');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-16">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Pacientes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra los pacientes del sistema
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Paciente
            </button>
          </div>
        </div>

        {/* Tabla de pacientes */}
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional Asignado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.professionalName || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openAssignModal(patient)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Asignar
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar nuevo paciente */}
      {isNewPatientModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddPatient}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre del Paciente
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      placeholder="Información adicional del paciente..."
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Agregar Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewPatientModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar profesional */}
      {isAssignModalOpen && selectedPatient && (
        <AssignModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedPatient(null);
          }}
          onAssign={handleAssign}
          patient={selectedPatient}
          professionals={professionals}
        />
      )}
    </div>
  );
};

export default PatientManagement; 