import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Inicio',
      href: '/',
      icon: HomeIcon,
      current: pathname === '/',
      roles: ['admin', 'professional', 'content_manager']
    },
    {
      name: 'Pacientes',
      href: '/patients',
      icon: UserGroupIcon,
      current: pathname.startsWith('/patients'),
      roles: ['admin', 'professional']
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: CalendarIcon,
      current: pathname === '/calendar',
      roles: ['admin', 'professional']
    },
    {
      name: 'Blog',
      href: '/blog',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/blog'),
      roles: ['admin', 'content_manager']
    },
    {
      name: 'Actividad',
      href: user?.role === 'admin'
        ? '/admin/activity'
        : '/professional/activity',
      icon: ChartBarIcon,
      current: pathname.endsWith('/activity'),
      roles: ['admin', 'professional', 'content_manager']
    },
    {
      name: 'Mensajes',
      href: '/messages',
      icon: ChatBubbleLeftIcon,
      current: pathname === '/messages',
      roles: ['admin', 'professional']
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Cog6ToothIcon,
      current: pathname === '/settings',
      roles: ['admin', 'professional', 'content_manager']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <img
            className="h-8 w-auto"
            src="/images/Logo.jpg"
            alt="Logo"
          />
        </div>
        <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${item.current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-6 w-6 flex-shrink-0
                  ${item.current
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 