import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types/Appointment';
import { CreateAppointmentDTO } from '../../services/appointments.service';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon as VolumeUpIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import AudioRecorder from '../../components/AudioRecorder';
import api from '../../services/api';
import { Patient } from '../../types/Patient';
import { Professional } from '../../types/Professional';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: CreateAppointmentDTO & { audioNote?: string }) => Promise<void>;
  selectedDate?: Date;
  selectedTime?: string;
  selectedAppointment?: Appointment;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AppointmentsCalendar = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>();
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { locale: es }),
    end: endOfWeek(currentWeek, { locale: es })
  });

  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
    if (user?.role === 'admin') {
      loadProfessionals();
    }
  }, [currentWeek, user]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      let response;
      if (user?.role === 'professional') {
        response = await api.get(`/appointments/professional/${user.id}`);
      } else {
        response = await api.get('/appointments');
      }
      // Asegurarnos de que appointments sea siempre un array
      const appointmentsData = response.data.appointments || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar las citas');
      setAppointments([]); // En caso de error, establecer un array vacío
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get('/patients');
      const patientsData = response.data.patients || response.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
      setPatients([]);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      const professionalsData = response.data.professionals || [];
      setProfessionals(Array.isArray(professionalsData) ? professionalsData : []);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
      toast.error('Error al cargar la lista de profesionales');
      setProfessionals([]);
    }
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      if (currentAudio.src === `${API_BASE_URL}${audioUrl}`) {
        setIsPlaying(false);
        setCurrentAudio(null);
        return;
      }
    }

    const audio = new Audio(`${API_BASE_URL}${audioUrl}`);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);
  };

  const getAppointmentsForSlot = (date: Date, time: string) => {
    if (!Array.isArray(appointments)) {
      console.error('appointments no es un array:', appointments);
      return [];
    }
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.date), date) && 
      appointment.startTime === time
    );
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleSlotClick = (date: Date, time: string) => {
    const existingAppointment = appointments.find(
      app => app.date === format(date, 'yyyy-MM-dd') && app.startTime === time
    );

    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedAppointment(existingAppointment);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (appointmentData: CreateAppointmentDTO & { audioNote?: string }) => {
    try {
      if (selectedAppointment) {
        await api.put(`/appointments/${selectedAppointment.id}`, appointmentData);
        toast.success('Cita actualizada correctamente');
      } else {
        await api.post('/appointments', appointmentData);
        toast.success('Cita creada correctamente');
      }
      await loadAppointments();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar la cita:', error);
      toast.error('Error al guardar la cita');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setSelectedAppointment(undefined);
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getAppointmentTypeLabel = (type: Appointment['type']) => {
    switch (type) {
      case 'first_time':
        return 'Primera vez';
      case 'emergency':
        return 'Emergencia';
      default:
        return 'Regular';
    }
  };

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'first_time':
        return 'bg-purple-500';
      case 'emergency':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentWeek, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => setCurrentWeek(new Date())}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Hoy
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 text-sm font-medium text-gray-500 bg-gray-50">Hora</div>
          {weekDays.map((day: Date, dayIndex: number) => (
            <div
              key={dayIndex}
              className={`p-4 text-sm font-medium ${
                isToday(day) 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'bg-gray-50 text-gray-500'
              }`}
            >
              <div className="text-xs uppercase tracking-wide">
                {format(day, 'EEEE', { locale: es })}
              </div>
              <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="divide-y">
          {timeSlots.map((time: string) => (
            <div key={time} className="grid grid-cols-8">
              <div className="p-4 text-sm font-medium text-gray-500 bg-gray-50 border-r">
                {time}
              </div>
              {weekDays.map((day: Date, dayIndex: number) => {
                const dayAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className={`p-2 border-l relative min-h-[5rem] hover:bg-gray-50 transition-colors ${
                      isToday(day) ? 'bg-blue-50/20' : ''
                    }`}
                    onClick={() => handleSlotClick(day, time)}
                  >
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-2 mb-1 rounded-lg border shadow-sm hover:shadow-md transition-all ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{appointment.patientName}</div>
                          {appointment.audioNote && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayAudio(appointment.audioNote!);
                              }}
                              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {currentAudio?.src === `${API_BASE_URL}${appointment.audioNote}` && isPlaying ? (
                                <PauseIcon className="h-4 w-4 text-gray-600" />
                              ) : (
                                <VolumeUpIcon className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-xs mt-1 flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${getTypeColor(appointment.type)}`} />
                          {getAppointmentTypeLabel(appointment.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedAppointment={selectedAppointment}
      />
    </div>
  );
};

// Componente Modal (implementación básica)
const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedTime,
  selectedAppointment
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: '',
    professionalId: user?.role === 'professional' ? user.id : '',
    type: 'regular',
    notes: '',
        startTime: selectedTime || '',
        endTime: '',
    audioNote: ''
      });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      if (user?.role === 'admin') {
        loadProfessionals();
      }
      
      if (selectedAppointment) {
        setFormData({
          patientId: selectedAppointment.patientId,
          professionalId: selectedAppointment.professionalId,
          type: selectedAppointment.type,
          notes: selectedAppointment.notes || '',
          startTime: selectedAppointment.startTime || '',
          endTime: selectedAppointment.endTime || '',
          audioNote: selectedAppointment.audioNote || ''
        });
      } else {
        // Para citas nuevas, establecer la hora de fin automáticamente una hora después
        const startTime = selectedTime || '';
        let endTime = '';
        if (startTime) {
          const [hours, minutes] = startTime.split(':');
          const endDate = new Date();
          endDate.setHours(parseInt(hours), parseInt(minutes));
          endDate.setHours(endDate.getHours() + 1);
          endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        }

        setFormData({
          patientId: '',
          professionalId: user?.role === 'professional' ? user.id : '',
          type: 'regular',
          notes: '',
          startTime,
          endTime,
          audioNote: ''
        });
      }
    }
  }, [isOpen, selectedAppointment, selectedTime, user]);

  const loadPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/professionals');
      setProfessionals(response.data.professionals || []);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
      toast.error('Error al cargar la lista de profesionales');
    }
  };

  const handleAudioRecordingComplete = async (blob: Blob) => {
    try {
      const formData = new FormData();
      const audioFile = new File([blob], 'audio-note.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);

      console.log('Subiendo archivo de audio:', audioFile.name, audioFile.type);

      const response = await api.post<{ url?: string; audioUrl?: string; message: string }>('/upload/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Respuesta del servidor:', response.data);

      const audioUrl = response.data.url || response.data.audioUrl;
      
      if (audioUrl) {
        setFormData(prev => ({
          ...prev,
          audioNote: audioUrl
        }));
        toast.success('Audio grabado correctamente');
      } else {
        console.error('No se recibió URL del audio en la respuesta:', response.data);
        throw new Error('No se recibió la URL del audio');
      }
    } catch (error: unknown) {
      console.error('Error al subir el audio:', error);
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        toast.error(apiError.response.data.message);
      } else {
      toast.error('Error al subir el audio');
      }
    }
  };

  const getFullAudioUrl = (audioUrl: string) => {
    if (!audioUrl) return '';
    return audioUrl.startsWith('http') ? audioUrl : `${API_BASE_URL}${audioUrl}`;
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    let newEndTime = formData.endTime;

    // Calcular automáticamente la hora de fin una hora después
    if (newStartTime) {
      const [hours, minutes] = newStartTime.split(':');
      const endDate = new Date();
      endDate.setHours(parseInt(hours), parseInt(minutes));
      endDate.setHours(endDate.getHours() + 1);
      newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    }

    setFormData(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime
    }));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    
    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.startTime && newEndTime) {
      const [startHours, startMinutes] = formData.startTime.split(':');
      const [endHours, endMinutes] = newEndTime.split(':');
      const startDate = new Date();
      const endDate = new Date();
      
      startDate.setHours(parseInt(startHours), parseInt(startMinutes));
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));

      if (endDate <= startDate) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      endTime: newEndTime
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.patientId || !formData.professionalId || !formData.type || 
          !formData.startTime || !formData.endTime) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      // Validar que la hora de fin sea posterior a la hora de inicio
      const [startHours, startMinutes] = formData.startTime.split(':');
      const [endHours, endMinutes] = formData.endTime.split(':');
      const startDate = new Date();
      const endDate = new Date();
      
      startDate.setHours(parseInt(startHours), parseInt(startMinutes));
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));

      if (endDate <= startDate) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }

      const appointmentData: CreateAppointmentDTO & { audioNote?: string } = {
        ...formData,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        type: formData.type as 'regular' | 'first_time' | 'emergency'
      };

      await onSave(appointmentData);
    } catch (error: unknown) {
      console.error('Error al guardar la cita:', error);
      toast.error('Error al guardar la cita');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Paciente</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Profesional</label>
              <select
                name="professionalId"
                value={formData.professionalId}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar profesional</option>
                {professionals.map(professional => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleStartTimeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="09:00"
                max="17:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora fin</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleEndTimeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="09:00"
                max="17:00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de cita</label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="regular">Regular</option>
              <option value="first_time">Primera vez</option>
              <option value="emergency">Emergencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nota de Audio</label>
          <div className="space-y-2">
              <AudioRecorder 
                onRecordingComplete={handleAudioRecordingComplete}
                showLabel={false}
                existingAudioUrl={formData.audioNote ? getFullAudioUrl(formData.audioNote) : undefined}
                />
              </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {selectedAppointment ? 'Guardar cambios' : 'Crear cita'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AppointmentsCalendar; 