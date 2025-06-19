import { Link, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  InboxIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: HomeIcon
    },
    {
      name: 'Gestión de Usuarios',
      path: '/admin/usuarios',
      icon: UsersIcon
    },
    {
      name: 'Gestión de Contenido',
      path: '/admin/contenido',
      icon: DocumentTextIcon
    },
    {
      name: 'Gestión de Pacientes',
      path: '/admin/patients',
      icon: UserGroupIcon
    },
    {
      name: 'Mensajes',
      path: '/admin/mensajes',
      icon: InboxIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">Panel Admin</h2>
          </div>
          <nav className="mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 