import React, { useEffect, useState } from 'react';
import { ChartBarIcon, UserGroupIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import ActivityFeed from '../components/ActivityFeed';
import activityService, { Activity } from '../services/activity.service';
import { motion } from 'framer-motion';

interface ActivityStats {
  totalActivities: number;
  newPatients: number;
  newPosts: number;
  completedAppointments: number;
}

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    newPatients: 0,
    newPosts: 0,
    completedAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const recentActivities = await activityService.getRecentActivities(20);
      setActivities(recentActivities);

      const newStats = {
        totalActivities: recentActivities.length,
        newPatients: recentActivities.filter(a => a.type === 'new_patient').length,
        newPosts: recentActivities.filter(a => a.type === 'new_post').length,
        completedAppointments: recentActivities.filter(a => a.type === 'appointment_update' && a.description.includes('completada')).length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className={`absolute top-4 right-4 ${color} rounded-lg p-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <motion.p 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-2 text-2xl font-bold text-gray-900"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Actividad del Sistema</h1>
              <p className="mt-1 text-sm text-gray-600">
                Registro de acciones y eventos recientes en la plataforma
              </p>
            </div>
            <div className="hidden sm:block">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="bg-indigo-50 rounded-lg p-2"
              >
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-4">
          <StatCard
            title="Total Actividades"
            value={stats.totalActivities}
            icon={ChartBarIcon}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard
            title="Nuevos Pacientes"
            value={stats.newPatients}
            icon={UserGroupIcon}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            title="Nuevos Artículos"
            value={stats.newPosts}
            icon={DocumentTextIcon}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Citas Completadas"
            value={stats.completedAppointments}
            icon={CalendarIcon}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-4">
            <h2 className="text-base font-medium text-gray-900">Actividad Reciente</h2>
            <div className="mt-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : activities.length > 0 ? (
                <ActivityFeed activities={activities} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No hay actividades recientes para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityPage; 