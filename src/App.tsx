import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './pages/PublicLayout';
import AdminLayout from './pages/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ActivityPage from './pages/ActivityPage';
import BlogNinosPage from './pages/BlogNinosPage';
import BlogAdultosPage from './pages/BlogAdultosPage';
import BlogNoticiasPage from './pages/BlogNoticiasPage';

// Admin pages
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ContentDashboard from './components/admin/ContentDashboard';
import PsychologistDashboard from './components/admin/PsychologistDashboard';
import PatientManagement from './components/admin/PatientManagement';
import AppointmentsCalendar from './components/admin/AppointmentsCalendar';
import PostEditor from './components/admin/PostEditor';
import AdminMessages from './pages/AdminMessages';
import StatsPage from './pages/StatsPage';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/profesionales" element={<ProfessionalsPage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/ninos" element={<BlogNinosPage />} />
            <Route path="/blog/adultos" element={<BlogAdultosPage />} />
            <Route path="/blog/noticias" element={<BlogNoticiasPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contacto" element={<ContactPage />} />
          </Route>
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="contenido" element={<ContentDashboard />} />
            <Route path="contenido/nuevo" element={<PostEditor />} />
            <Route path="contenido/editar/:id" element={<PostEditor />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="calendario" element={<AppointmentsCalendar />} />
            <Route path="mensajes" element={<AdminMessages />} />
            <Route path="reportes" element={<StatsPage />} />
            <Route path="activity" element={<ActivityPage />} />
          </Route>

          {/* Content Manager routes */}
          <Route path="/content" element={
            <ProtectedRoute allowedRoles={['content_manager']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ContentDashboard />} />
            <Route path="nuevo" element={<PostEditor />} />
            <Route path="editar/:id" element={<PostEditor />} />
          </Route>

          {/* Professional routes */}
          <Route path="/professional" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PsychologistDashboard />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="calendario" element={<AppointmentsCalendar />} />
            <Route path="activity" element={<ActivityPage />} />
          </Route>
          
          {/* Activity routes */}
          <Route path="/activity" element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Placeholder pages
const NotFoundPage = () => <div className="py-20 text-center">Página no encontrada</div>;

export default App;