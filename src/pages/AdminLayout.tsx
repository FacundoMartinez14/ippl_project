import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Update page title based on the current path
    const path = location.pathname.split('/').pop() || 'dashboard';
    let title = 'Panel Admin';
    
    switch (path) {
      case 'admin':
        title = 'Dashboard | Panel Admin';
        break;
      case 'usuarios':
        title = 'Usuarios | Panel Admin';
        break;
      case 'contenido':
        title = 'Contenido | Panel Admin';
        break;
      case 'profesionales':
        title = 'Profesionales | Panel Admin';
        break;
      default:
        title = 'Panel Admin | IPPL';
    }
    
    document.title = title;
  }, [location.pathname]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4">
        <Outlet />
      </main>
      
      <footer className="bg-white shadow-inner py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} IPPL - Panel Administrativo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;