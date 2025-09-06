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

  const filteredAppointments = appointments
  .filter(a => a.patientName.toLowerCase().includes(search.toLowerCase()))
  .filter(a => typeFilter === "todos" || a.type === typeFilter)
  .filter(a => attendedFilter === "todos" || (attendedFilter === "si" ? a.attended : !a.attended));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const badge = (ok?: boolean) =>
  `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
    ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
          {/* Bloque izquierda */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <button
              onClick={() => navigate('/professional')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Citas Finalizadas</h1>
          </div>

          {/* Bloque derecha */}
          <div className="flex items-center gap-3 md:justify-end">
            <button
              onClick={handleRefresh}
              className={`flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isRefreshing}
            >
              <ArrowPathIcon
                className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Actualizar
            </button>
          </div>
        </div>


        {appointments.length > 0 ? (
          <>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <input
                type="text"
                placeholder="Buscar por paciente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-64"
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="first_time">Primera vez</option>
                  <option value="regular">Regular</option>
                  <option value="emergency">Emergencia</option>
                </select>
                <select
                  value={attendedFilter}
                  onChange={e => setAttendedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="todos">Asistieron y no asistieron</option>
                  <option value="si">Sí asistió</option>
                  <option value="no">No asistió</option>
                </select>
              </div>
            </div>
          {/* Tabla: visible en desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistió</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{formatDate(appointment.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.type === 'regular' ? 'Regular' :
                          appointment.type === 'first_time' ? 'Primera Vez' : 'Emergencia'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">  
                          <span className={badge(appointment.attended)}>
                            {appointment.attended ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${appointment.paymentAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${appointment.remainingBalance?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {appointment.attended && getPatientTotalDebt(appointment.patientId) > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setEditPaymentAmount(appointment.paymentAmount || 0);
                                setEditRemainingBalance(appointment.remainingBalance || 0);
                                setShowEditPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Actualizar pago"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          {/* Cards: visible en mobile/tablet */}
            <div className="block md:hidden space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-6 w-6 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {appointment.patientName}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{formatDate(appointment.date)}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs rounded px-2 py-1 bg-gray-100 text-gray-700">
                          {appointment.type === 'regular'
                            ? 'Regular'
                            : appointment.type === 'first_time'
                            ? 'Primera Vez'
                            : 'Emergencia'}
                        </span>
                        <span className={badge(appointment.attended)}>
                          {appointment.attended ? 'Asistió: Sí' : 'Asistió: No'}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded bg-gray-50 p-2">
                          <div className="text-gray-500">Pago</div>
                          <div className="font-medium text-gray-900">
                            ${appointment.paymentAmount?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div className="rounded bg-gray-50 p-2">
                          <div className="text-gray-500">Saldo</div>
                          <div className="font-medium text-gray-900">
                            ${appointment.remainingBalance?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="mt-3 flex justify-end">
                        {appointment.attended && getPatientTotalDebt(appointment.patientId) > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setEditPaymentAmount(appointment.paymentAmount || 0);
                              setEditRemainingBalance(appointment.remainingBalance || 0);
                              setShowEditPaymentModal(true);
                            }}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            title="Actualizar pago"
                          >
                            <PencilIcon className="h-5 w-5 mr-1" />
                            Actualizar pago
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas finalizadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes ninguna cita finalizada registrada.
            </p>
          </div>
        )}
      </div>
      {showEditPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Actualizar Pago de la Cita</h2>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1">Saldo pendiente acumulado del paciente:</span>
              <span className="block text-lg font-bold text-red-600 mb-2">
                ${getPatientTotalDebt(selectedAppointment.patientId).toFixed(2)}
              </span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a abonar</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editPaymentAmount}
                min={0}
                onChange={e => setEditPaymentAmount(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo pendiente de esta cita</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editRemainingBalance}
                min={0}
                onChange={e => setEditRemainingBalance(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditPaymentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                  } catch (error) {
                    toast.error('Error al actualizar el pago');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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