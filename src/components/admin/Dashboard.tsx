import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import statsService, { SystemStats, ProfessionalStats } from '../../services/stats.service';
import postsService, { Post } from '../../services/posts.service';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  NewspaperIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

// Interfaces
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  detail: string;
}

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  stats: string[];
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface ActivityItemProps {
  color: string;
  text: string;
  time: string;
}

interface Message {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [professionalStats, setProfessionalStats] = useState<ProfessionalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentMessages();
    loadRecentPosts();
  }, [user]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      if (user?.role === 'admin') {
        const stats = await statsService.getSystemStats();
        setSystemStats(stats);
      } else if (user?.role === 'professional') {
        const stats = await statsService.getProfessionalStats(user.id);
        setProfessionalStats(stats);
      }
    } catch (error) {
      toast.error('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentMessages = async () => {
    try {
      setMessageError(null);
      const response = await axios.get(`${API_URL}/messages`);
      // Messages are already sorted by date on the backend, just take the first 3
      setRecentMessages(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading messages:', error);
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        setMessageError('No se pudo conectar con el servidor de mensajes');
      } else {
        setMessageError('Error al cargar los mensajes');
      }
    }
  };

  const loadRecentPosts = async () => {
    try {
      const response = await postsService.getAllPosts();
      // Ordenar los posts por fecha de publicación y tomar los 4 más recientes
      const sortedPosts = response.posts
        .filter(post => post.status === 'published')
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
        .slice(0, 4);
      setRecentPosts(sortedPosts);
    } catch (error) {
      console.error('Error al cargar posts recientes:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
    toast.success('Datos actualizados');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-16 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Control
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenido, {user?.name}
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

        {user?.role === 'admin' && systemStats && (
          <>
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Usuarios Totales",
                  value: systemStats.users.total,
                  detail: `${systemStats.users.active} activos`,
                  icon: UserGroupIcon,
                  color: "blue"
                },
                {
                  title: "Pacientes",
                  value: systemStats.patients.total,
                  detail: `${systemStats.patients.active} activos`,
                  icon: UserIcon,
                  color: "green"
                },
                {
                  title: "Posts Publicados",
                  value: systemStats.posts.published,
                  detail: `${systemStats.posts.totalViews} vistas`,
                  icon: DocumentTextIcon,
                  color: "purple"
                },
                {
                  title: "Citas Próximas",
                  value: systemStats.appointments.upcoming,
                  detail: `${systemStats.appointments.completed} completadas`,
                  icon: CalendarIcon,
                  color: "yellow",
                  onClick: () => navigate(user?.role === 'admin' ? '/admin/calendario' : '/professional/calendario')
                }
              ].map((stat, index) => (
                <div 
                  key={`stat-${index}`} 
                  className={`bg-gradient-to-br from-[#80C0D0] to-[#4CAFB8] rounded-xl p-6 cursor-pointer hover:shadow-md transition-all`}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center">
                    <div className={`bg-[#006C73]/10 p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 text-[#006C73]`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className={`text-xs text-[#006C73] mt-1`}>{stat.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Secciones de Gestión */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Gestión de Personal",
                  icon: BriefcaseIcon,
                  color: "blue",
                  route: "/admin/usuarios",
                  stats: [
                    { label: "Profesionales", value: systemStats.users.byRole.professional },
                    { label: "Gestores de Contenido", value: systemStats.users.byRole.content_manager },
                    { label: "Administradores", value: systemStats.users.byRole.admin }
                  ]
                },
                {
                  title: "Gestión de Contenido",
                  icon: NewspaperIcon,
                  color: "purple",
                  route: "/admin/contenido",
                  stats: [
                    { label: "Posts Publicados", value: systemStats.posts.published },
                    { label: "Borradores", value: systemStats.posts.drafts },
                    { label: "Comentarios", value: systemStats.posts.comments }
                  ]
                },
                {
                  title: "Gestión de Pacientes",
                  icon: ClipboardDocumentListIcon,
                  color: "green",
                  route: "/admin/patients",
                  stats: [
                    { label: "Pacientes con Citas", value: systemStats.patients.withAppointments },
                    { label: "Profesionales Asignados", value: Object.keys(systemStats.patients.byProfessional).length },
                    { label: "Pacientes Activos", value: systemStats.patients.active }
                  ]
                }
              ].map((section, index) => (
                <div 
                  key={`section-${index}`}
                  onClick={() => navigate(section.route)}
                  className="bg-[#F9FAFB] rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border border-[#E5E7EB]"
                >
                  <div className="flex items-center mb-4">
                    <div className={`bg-[#006C73]/10 p-3 rounded-xl`}>
                      <section.icon className={`h-6 w-6 text-[#006C73]`} />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {section.stats.map((stat, statIndex) => (
                      <div key={`stat-${index}-${statIndex}`} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="font-medium text-gray-900">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Accesos Rápidos */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: "Calendario",
                  description: "Gestión de citas",
                  icon: CalendarIcon,
                  route: '/admin/calendario'
                },
                {
                  title: "Reportes",
                  description: "Estadísticas y análisis",
                  icon: PresentationChartLineIcon,
                  route: '/admin/reportes'
                },
                {
                  title: "Blog",
                  description: "Gestión de contenidos",
                  icon: BookOpenIcon,
                  route: '/admin/contenido'
                },
                {
                  title: "Mensajes",
                  description: "Mensajes de contacto",
                  icon: ChatBubbleLeftRightIcon,
                  route: '/admin/mensajes'
                },
                {
                  title: "Actividad",
                  description: "Registro de acciones",
                  icon: ChartBarIcon,
                  route: '/admin/activity'
                }
              ].map((card, index) => (
                <QuickAccessCard
                  key={`quick-access-${index}`}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  onClick={() => navigate(card.route)}
                />
              ))}
            </div>

            {/* Actividad Reciente y Mensajes */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actividad Reciente */}
              <div className="bg-[#F9FAFB] rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Actividad Reciente
                  </h3>
                  <button
                    onClick={() => navigate('/admin/activity')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todo
                  </button>
                </div>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <ActivityItem
                      key={post.id}
                      color="bg-purple-500"
                      text={`Nueva publicación: ${post.title}`}
                      time={formatTimeAgo(new Date(post.publishedAt || post.createdAt))}
                    />
                  ))}
                  {[
                    {
                      id: 'activity-1',
                      color: "bg-green-500",
                      text: "Nuevo paciente registrado: María González",
                      time: "Hace 2 horas"
                    },
                    {
                      id: 'activity-2',
                      color: "bg-blue-500",
                      text: "Cita completada con Juan Pérez",
                      time: "Hace 3 horas"
                    }
                  ].map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      color={activity.color}
                      text={activity.text}
                      time={activity.time}
                    />
                  ))}
                </div>
              </div>

              {/* Últimos Mensajes */}
              <div className="bg-[#F9FAFB] rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Últimos Mensajes
                  </h3>
                  <button
                    onClick={() => navigate('/admin/mensajes')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {messageError ? (
                    <div key="message-error" className="text-center py-4">
                      <p className="text-red-600">{messageError}</p>
                      <button
                        onClick={loadRecentMessages}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : recentMessages.length > 0 ? (
                    recentMessages.map((msg) => (
                      <MessageItem
                        key={msg._id}
                        name={`${msg.nombre} ${msg.apellido}`}
                        email={msg.correoElectronico}
                        preview={msg.mensaje}
                        time={formatTimeAgo(new Date(msg.fecha))}
                        isUnread={!msg.leido}
                      />
                    ))
                  ) : (
                    <p key="no-messages" className="text-gray-500 text-center py-4">
                      No hay mensajes recientes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, description, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-[#E5E7EB]"
  >
    <div className="flex items-center">
      <div className="bg-[#006C73]/10 p-3 rounded-xl">
        <Icon className="h-6 w-6 text-[#006C73]" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </div>
);

interface ActivityItemProps {
  color: string;
  text: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ color, text, time }) => (
  <div className="flex items-center bg-[#F9FAFB] rounded-lg p-4 shadow-sm">
    <div className={`w-2 h-2 ${color} rounded-full mr-3`}></div>
    <span className="text-gray-600 flex-grow text-sm">{text}</span>
    <span className="text-xs text-gray-400">{time}</span>
  </div>
);

const MessageItem: React.FC<{
  name: string;
  email: string;
  preview: string;
  time: string;
  isUnread?: boolean;
}> = ({ name, email, preview, time, isUnread }) => (
  <div className={`p-4 rounded-lg ${isUnread ? 'bg-blue-50' : 'bg-gray-50'}`}>
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{name}</h4>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
    <p className="text-sm text-gray-600 line-clamp-1">{preview}</p>
    {isUnread && (
      <div className="mt-2 flex items-center">
        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        <span className="ml-2 text-xs text-blue-600 font-medium">Nuevo mensaje</span>
      </div>
    )}
  </div>
);

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `Hace ${diffInMinutes} minutos`;
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  }
};

export default Dashboard;