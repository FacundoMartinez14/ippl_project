import React, { useState, useEffect } from 'react';
import { Activity } from '../types/Activity';
import activityService from '../services/activity.service';
import { BellIcon, CheckCircleIcon, ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivities();
      setActivities(data);
      setError(null);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (activityId: string) => {
    try {
      await activityService.markAsRead(activityId);
      setActivities(activities.map(activity => 
        activity._id === activityId 
          ? { ...activity, read: true }
          : activity
      ));
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await activityService.markAllAsRead();
      setActivities(activities.map(activity => ({ ...activity, read: true })));
    } catch (error) {
      console.error('Error marking all activities as read:', error);
    }
  };

  const handleClearAll = async () => {
    setShowConfirm(true);
  };

  const confirmClearAll = async () => {
    setShowConfirm(false);
    try {
      await activityService.clearAllActivities();
      setActivities([]);
      toast.success('Todas las actividades han sido eliminadas');
    } catch (error) {
      console.error('Error clearing activities:', error);
      toast.error('Error al limpiar las actividades');
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'NEW_POST':
        return '📝';
      case 'NEW_PATIENT':
        return '👤';
      case 'APPOINTMENT_COMPLETED':
        return '✅';
      case 'PATIENT_DISCHARGE_REQUEST':
        return '🔔';
      case 'NEW_MESSAGE':
        return '✉️';
      default:
        return '📌';
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver
            </button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Actividad Reciente
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Aquí puedes ver todas las actividades y notificaciones recientes del sistema
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {activities.some(a => !a.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Marcar todo como leído
              </button>
            )}
            {activities.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Limpiar Registros
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600">
              <p>{error}</p>
              <button 
                onClick={loadActivities}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.filter(activity => [
                'PATIENT_DISCHARGE_REQUEST',
                'PATIENT_ACTIVATION_REQUEST',
                'STATUS_CHANGE_APPROVED',
                'STATUS_CHANGE_REJECTED',
                'FREQUENCY_CHANGE_REQUEST',
                'FREQUENCY_CHANGE_APPROVED',
                'FREQUENCY_CHANGE_REJECTED'
              ].includes(activity.type)).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No hay notificaciones pendientes</p>
                </div>
              ) : (
                activities.filter(activity => [
                  'PATIENT_DISCHARGE_REQUEST',
                  'PATIENT_ACTIVATION_REQUEST',
                  'STATUS_CHANGE_APPROVED',
                  'STATUS_CHANGE_REJECTED',
                  'FREQUENCY_CHANGE_REQUEST',
                  'FREQUENCY_CHANGE_APPROVED',
                  'FREQUENCY_CHANGE_REJECTED'
                ].includes(activity.type)).map((activity) => (
                  <div
                    key={activity._id}
                    className={`p-4 ${!activity.read ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🔔</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        {activity.metadata?.reason && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            <span className="font-medium">Motivo:</span> {activity.metadata.reason}
                          </p>
                        )}
                        {activity.metadata?.professionalName && (
                          <p className="text-xs text-gray-500 mt-2">
                            Solicitado por: {activity.metadata.professionalName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(activity.date)}
                        </p>
                      </div>
                      {!activity.read && (
                        <button
                          onClick={() => handleMarkAsRead(activity._id)}
                          className="flex-shrink-0"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmClearAll}
        title="¿Eliminar todas las actividades?"
        message="¿Estás seguro de que deseas eliminar todas las actividades? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ActivityPage; 