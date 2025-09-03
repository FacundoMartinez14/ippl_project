import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentsService from '../../services/appointments.service';
import { Appointment } from '../../types/Appointment';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CompletedAppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState<number>(0);
  const [editRemainingBalance, setEditRemainingBalance] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [attendedFilter, setAttendedFilter] = useState("todos");

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await appointmentsService.getProfessionalAppointments(user.id);
      // Filtrar solo las citas completadas
      const completedAppointments = data.filter(appointment => appointment.status === 'completed');
      setAppointments(completedAppointments);
    } catch (error) {
      console.error('Error al cargar las citas:', error);
      toast.error('Error al cargar las citas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
    toast.success('Datos actualizados');
  };

  // Calcular el saldo pendiente acumulado de un paciente
  const getPatientTotalDebt = (patientId: string) => {
    return appointments
      .filter(a => a.patientId === patientId && a.attended)
      .reduce((acc, curr) => acc + (curr.remainingBalance || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/professional')}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-fit"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver al Dashboard
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Citas Finalizadas
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleRefresh}
              className={`flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''} w-full sm:w-auto`}
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
              <span className="sm:hidden">Actualizar</span>
            </button>
          </div>
        </div>

        {appointments.length > 0 ? (
          <>
            <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Buscar por paciente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="first_time">Primera vez</option>
                  <option value="regular">Regular</option>
                  <option value="emergency">Emergencia</option>
                </select>
                <select
                  value={attendedFilter}
                  onChange={e => setAttendedFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                >
                  <option value="todos">Asistieron y no asistieron</option>
                  <option value="si">Sí asistió</option>
                  <option value="no">No asistió</option>
                </select>
              </div>
            </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistió
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Pendiente
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {appointments
                    .filter(a => a.patientName.toLowerCase().includes(search.toLowerCase()))
                    .filter(a => typeFilter === "todos" || a.type === typeFilter)
                    .filter(a => attendedFilter === "todos" || (attendedFilter === "si" ? a.attended : !a.attended))
                    .map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                        <span className="text-xs sm:text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {appointment.type === 'regular' ? 'Regular' : 
                       appointment.type === 'first_time' ? 'Primera Vez' : 'Emergencia'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.attended ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ${appointment.paymentAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ${appointment.remainingBalance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      {appointment.attended && getPatientTotalDebt(appointment.patientId) > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setEditPaymentAmount(appointment.paymentAmount || 0);
                            setEditRemainingBalance(appointment.remainingBalance || 0);
                            setShowEditPaymentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Actualizar pago"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <CalendarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas finalizadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes ninguna cita finalizada registrada.
            </p>
          </div>
        )}
      </div>
      {showEditPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Actualizar Pago de la Cita</h2>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1">Saldo pendiente acumulado del paciente:</span>
              <span className="block text-base sm:text-lg font-bold text-red-600 mb-2">
                ${getPatientTotalDebt(selectedAppointment.patientId).toFixed(2)}
              </span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a abonar</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={editPaymentAmount}
                min={0}
                onChange={e => setEditPaymentAmount(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo pendiente de esta cita</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={editRemainingBalance}
                min={0}
                onChange={e => setEditRemainingBalance(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowEditPaymentModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await appointmentsService.updateAppointment(selectedAppointment.id, {
                      paymentAmount: editPaymentAmount,
                      remainingBalance: editRemainingBalance,
                    });
                    await loadAppointments();
                    setShowEditPaymentModal(false);
                    toast.success('Pago actualizado correctamente');
                  } catch {
                    toast.error('Error al actualizar el pago');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedAppointmentsPage; 