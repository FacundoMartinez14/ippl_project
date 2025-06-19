import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData
} from 'chart.js';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import postsService from '../services/posts.service';
import { useAuth } from '../context/AuthContext';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: number;
};

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }: StatCardProps) => (
  <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden`}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs. semana anterior
            </p>
          )}
        </div>
        <div className={`${bgColor} rounded-xl p-4`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
    <div className={`h-1 ${bgColor}`}></div>
  </div>
);

const StatsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    activeUsers: 0,
    activeDoctors: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0
  });

  const [visitData, setVisitData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      // Aquí cargaríamos los datos reales desde el backend
      const response = await postsService.getStats();
      setStats(response);

      // Datos de ejemplo para el gráfico
      const lastWeek = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      });

      setVisitData({
        labels: lastWeek,
        datasets: [
          {
            label: 'Visitas',
            data: response.weeklyVisits || [65, 59, 80, 81, 56, 55, 40],
            fill: true,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(99, 102, 241)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
          }
        ]
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
            <p className="mt-2 text-indigo-100 max-w-2xl">
              Análisis detallado del rendimiento de la plataforma
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-xl p-4">
              <ChartBarIcon className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-indigo-200 mr-2" />
              <span className="text-sm text-indigo-100">Usuarios Totales</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.activeUsers + stats.activeDoctors}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 text-indigo-200 mr-2" />
              <span className="text-sm text-indigo-100">Vistas este mes</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalViews}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-indigo-200 mr-2" />
              <span className="text-sm text-indigo-100">Posts Activos</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalPosts}</p>
          </div>
        </div>
      </div>

      {/* Gráfico principal de visitas */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Visitas de la Última Semana</h2>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              <span className="mr-1">•</span> Visitas diarias
            </span>
          </div>
        </div>
        <div className="h-[400px]">
          <Line
            data={visitData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  },
                  displayColors: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0,0,0,0.05)',
                  },
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Usuarios Activos"
          value={stats.activeUsers}
          icon={UsersIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={12}
        />
        <StatCard
          title="Doctores Activos"
          value={stats.activeDoctors}
          icon={UserGroupIcon}
          color="text-green-600"
          bgColor="bg-green-50"
          trend={8}
        />
        <StatCard
          title="Total de Visitas"
          value={stats.totalVisits}
          icon={ChartBarIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={15}
        />
        <StatCard
          title="Posts Publicados"
          value={stats.totalPosts}
          icon={DocumentTextIcon}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
          trend={5}
        />
        <StatCard
          title="Vistas Totales"
          value={stats.totalViews}
          icon={EyeIcon}
          color="text-pink-600"
          bgColor="bg-pink-50"
          trend={20}
        />
        <StatCard
          title="Likes Totales"
          value={stats.totalLikes}
          icon={HeartIcon}
          color="text-red-600"
          bgColor="bg-red-50"
          trend={10}
        />
      </div>
    </div>
  );
};

export default StatsPage; 