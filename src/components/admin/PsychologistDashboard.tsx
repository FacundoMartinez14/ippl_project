import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientsService, { Patient } from '../../services/patients.service';
import { 
  UserIcon, 
  MicrophoneIcon, 
  ClockIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PsychologistDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientsService.getProfessionalPatients(user!.id);
      setPatients(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPatients();
    setIsRefreshing(false);
    toast.success('Datos actualizados');
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

  const getFullUrl = (audioUrl: string) => {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http')) return audioUrl;
    
    // Asegurarse de que la ruta use /uploads/audios/
    let normalizedUrl = audioUrl;
    if (normalizedUrl.includes('/uploads/audio/')) {
      normalizedUrl = normalizedUrl.replace('/uploads/audio/', '/uploads/audios/');
    }
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = `/uploads/audios/${normalizedUrl}`;
    }
    return `${API_BASE_URL}${normalizedUrl}`;
  };

  const handlePlayAudio = async (audioUrl: string) => {
    try {
    const fullUrl = getFullUrl(audioUrl);
      console.log('Intentando reproducir audio desde:', fullUrl);
    
      if (audioRef.current) {
        // Si es el mismo audio que está sonando actualmente
    if (audioUrl === currentAudioUrl && isPlaying) {
          audioRef.current.pause();
      setIsPlaying(false);
          return;
        }

        // Si es un nuevo audio
      if (audioUrl !== currentAudioUrl) {
          // Detener cualquier reproducción actual
          audioRef.current.pause();
          setIsPlaying(false);

          // Intentar cargar el audio primero
          try {
            console.log('Solicitando archivo de audio:', fullUrl);
            const response = await fetch(fullUrl, {
              headers: {
                'Accept': 'audio/webm,audio/ogg,audio/*;q=0.9,*/*;q=0.8'
              }
            });
            
            if (!response.ok) {
              if (response.status === 404) {
                console.error('Archivo de audio no encontrado:', fullUrl);
                toast.error('El archivo de audio no se encuentra en el servidor');
              } else {
                console.error(`Error HTTP ${response.status}:`, await response.text());
                toast.error(`Error al cargar el audio: ${response.statusText}`);
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log('Tipo de contenido recibido:', contentType);
            
            if (!contentType || (!contentType.includes('audio/webm') && !contentType.includes('audio/ogg'))) {
              console.error('Tipo de contenido no válido:', contentType);
              toast.error('El archivo de audio no tiene el formato correcto');
              throw new Error(`Tipo de contenido no válido: ${contentType}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Limpiar URL anterior si existe
            if (audioRef.current.src) {
              URL.revokeObjectURL(audioRef.current.src);
            }
            
            audioRef.current.src = objectUrl;
            setCurrentAudioUrl(audioUrl);
            
            // Configurar manejadores de eventos
            audioRef.current.onloadedmetadata = async () => {
              try {
                console.log('Audio cargado, intentando reproducir');
                await audioRef.current?.play();
                setIsPlaying(true);
              } catch (playError) {
                console.error('Error al reproducir:', playError);
                toast.error('Error al iniciar la reproducción del audio');
                setIsPlaying(false);
              }
            };

            audioRef.current.onerror = (e) => {
              const error = e as ErrorEvent;
              console.error('Error en el elemento de audio:', error);
              toast.error('Error al cargar el archivo de audio en el reproductor');
      setIsPlaying(false);
      setCurrentAudioUrl(null);
    };

          } catch (error) {
            console.error('Error cargando el audio:', error);
            setIsPlaying(false);
            setCurrentAudioUrl(null);
            return;
          }
        } else {
          // Es el mismo audio pero estaba pausado
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.error('Error reproduciendo audio:', error);
            toast.error('Error al reanudar la reproducción del audio');
            setIsPlaying(false);
          }
        }
      }
    } catch (error) {
      console.error('Error al manejar el audio:', error);
      setIsPlaying(false);
      setCurrentAudioUrl(null);
      }
    };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePatients = patients.filter(p => p.status === 'active');
  const pendingPatients = patients.filter(p => p.status === 'pending');
  const todayAppointments = patients.filter(p => {
    if (!p.nextAppointment) return false;
    const appointmentDate = new Date(p.nextAppointment);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  // Calcular estadísticas financieras
  const calculateFinancialStats = () => {
    const activePatients = patients.filter(p => p.status === 'active');
    const totalSessionCost = activePatients.reduce((sum, patient) => sum + (patient.sessionCost || 0), 0);
    const totalCommission = activePatients.reduce((sum, patient) => sum + (patient.commission || 0), 0);
    const professionalEarnings = totalSessionCost - totalCommission;

    return {
      totalSessionCost,
      totalCommission,
      professionalEarnings,
      averageSessionCost: activePatients.length ? totalSessionCost / activePatients.length : 0
    };
  };

  const financialStats = calculateFinancialStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-16 space-y-8">
      <audio 
        ref={audioRef} 
        className="hidden" 
        onEnded={() => {
          setIsPlaying(false);
          setCurrentAudioUrl(null);
        }}
        onError={(e) => {
          console.error('Error en el elemento de audio:', e);
          toast.error('Error al reproducir el audio');
          setIsPlaying(false);
          setCurrentAudioUrl(null);
        }}
      />
      
      {/* Header con Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Panel de control para la gestión de pacientes
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className={`flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{activePatients.length}</h3>
                <p className="text-sm text-gray-600">Pacientes Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{pendingPatients.length}</h3>
                <p className="text-sm text-gray-600">Pacientes Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
                <p className="text-sm text-gray-600">Citas Hoy</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate('/professional/calendario')}>
            <div className="flex items-center">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Calendario</h3>
                <p className="text-sm text-gray-600">Ver todas las citas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nueva sección de estadísticas financieras */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ingreso Total</p>
                <h3 className="text-xl font-bold text-gray-900">${financialStats.professionalEarnings.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Costo Promedio/Sesión</p>
                <h3 className="text-xl font-bold text-gray-900">${financialStats.averageSessionCost.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Comisiones</p>
                <h3 className="text-xl font-bold text-gray-900">${financialStats.totalCommission.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Facturado</p>
                <h3 className="text-xl font-bold text-gray-900">${financialStats.totalSessionCost.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'pending')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Mis Pacientes
            <span className="ml-2 text-sm text-gray-500">({filteredPatients.length} pacientes)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Asignación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Cita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Sesión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mi Ganancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.name}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.assignedAt ? new Date(patient.assignedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${patient.sessionCost?.toFixed(2) || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${((patient.sessionCost || 0) - (patient.commission || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {patient.audioNote && (
                        <button
                          onClick={() => handlePlayAudio(patient.audioNote!)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full"
                        >
                          {currentAudioUrl === patient.audioNote && isPlaying ? (
                            <>
                              <PauseIcon className="h-5 w-5" />
                              <span className="text-sm">Pausar Audio</span>
                            </>
                          ) : (
                            <>
                              <PlayIcon className="h-5 w-5" />
                              <span className="text-sm">Reproducir Audio</span>
                            </>
                          )}
                        </button>
                      )}
                      {patient.textNote && (
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                          <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm max-w-xs truncate" title={patient.textNote}>
                            {patient.textNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-full"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no tienes pacientes asignados a tu cargo'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PsychologistDashboard; 