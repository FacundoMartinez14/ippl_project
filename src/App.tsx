import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './pages/PublicLayout';
import AdminLayout from './pages/AdminLayout';
import FinancialLayout from './pages/FinancialLayout';

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
import MedicalHistoryPage from './pages/MedicalHistoryPage';

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
import ProfessionalPatients from './components/professional/ProfessionalPatients';
import StatusRequestsManagement from './components/admin/StatusRequestsManagement';

// Financial pages
import FinancialDashboard from './components/admin/FinancialDashboard';
import ReportsPage from './pages/admin/ReportsPage';
import FinancialPagosPage from './pages/FinancialPagosPage';
import FinancialSolicitudesPage from './pages/FinancialSolicitudesPage';

// New pages
import TodayAppointmentsPage from './pages/professional/TodayAppointmentsPage';
import AllActivitiesPage from './pages/professional/AllActivitiesPage';
import CompletedAppointmentsPage from './pages/professional/CompletedAppointmentsPage';
import NotFoundReports from './pages/404';

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

  if (user.status === 'inactive') {
    return <Navigate to="/login" replace />;
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
            <Route path="profesionales" element={<PsychologistDashboard />} />
            <Route path="pacientes" element={<PatientManagement />} />
            <Route path="medical-history/:patientId" element={<MedicalHistoryPage />} />
            <Route path="calendario" element={<AppointmentsCalendar />} />
            <Route path="mensajes" element={<AdminMessages />} />
            <Route path="estadisticas" element={<StatsPage />} />
            <Route path="solicitudes" element={<StatusRequestsManagement />} />
            <Route path="actividad" element={<ActivityPage />} />
          </Route>

          {/* Financial routes */}
          <Route path="/financial" element={
            <ProtectedRoute allowedRoles={['financial']}>
              <FinancialLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FinancialDashboard />} />
            <Route path="pagos" element={<FinancialPagosPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="solicitudes" element={<FinancialSolicitudesPage />} />
            <Route path="facturas" element={<div className="p-6">Página de Facturas (En desarrollo)</div>} />
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
              <PsychologistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/professional/pacientes" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <ProfessionalPatients />
            </ProtectedRoute>
          } />
          <Route path="/professional/pacientes/:patientId/medical-history" element={
            <ProtectedRoute allowedRoles={['professional', 'admin']}>
              <MedicalHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/professional/calendario" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <AppointmentsCalendar />
            </ProtectedRoute>
          } />
          <Route path="/professional/citas-hoy" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <TodayAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/professional/citas-finalizadas" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <CompletedAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/professional/actividades" element={
            <ProtectedRoute allowedRoles={['professional']}>
              <AllActivitiesPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback routes */}
          <Route path="/404" element={<NotFoundReports />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;