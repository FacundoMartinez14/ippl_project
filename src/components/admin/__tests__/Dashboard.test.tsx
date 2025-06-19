import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import Dashboard from '../Dashboard';
import '@testing-library/jest-dom';

// Mock de los servicios
vi.mock('../../../services/stats.service', () => ({
  default: {
    getSystemStats: vi.fn().mockResolvedValue({
      users: {
        total: 100,
        active: 80,
        byRole: {
          admin: 5,
          professional: 20,
          content_manager: 10
        }
      },
      patients: {
        total: 500,
        active: 450,
        withAppointments: 300,
        byProfessional: { "prof1": 20, "prof2": 30 }
      },
      posts: {
        published: 50,
        drafts: 10,
        totalViews: 1000,
        totalLikes: 500,
        comments: 200
      },
      appointments: {
        upcoming: 30,
        completed: 150
      }
    }),
    getProfessionalStats: vi.fn().mockResolvedValue({
      patients: 20,
      appointments: {
        upcoming: 5,
        completed: 15
      },
      posts: 10
    })
  }
}));

// Mock del contexto de autenticación
const mockUser = {
  id: '1',
  name: 'Admin Test',
  email: 'admin@test.com',
  role: 'admin'
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider initialUser={mockUser}>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el dashboard para administrador correctamente', async () => {
    renderDashboard();

    // Verificar que se muestre el título
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    
    // Verificar que se muestre el mensaje de bienvenida
    expect(screen.getByText(/Bienvenido, Admin Test/i)).toBeInTheDocument();

    // Esperar a que se carguen las estadísticas
    await waitFor(() => {
      // Verificar estadísticas principales
      expect(screen.getByText('100')).toBeInTheDocument(); // Total usuarios
      expect(screen.getByText('500')).toBeInTheDocument(); // Total pacientes
      expect(screen.getByText('50')).toBeInTheDocument(); // Posts publicados
      expect(screen.getByText('30')).toBeInTheDocument(); // Citas próximas
    });
  });

  it('muestra el botón de actualizar y responde al clic', async () => {
    renderDashboard();

    const updateButton = screen.getByRole('button', { name: /actualizar datos/i });
    expect(updateButton).toBeInTheDocument();

    // Simular clic en actualizar
    fireEvent.click(updateButton);

    // Verificar que el botón se deshabilite durante la actualización
    expect(updateButton).toBeDisabled();

    // Esperar a que se complete la actualización
    await waitFor(() => {
      expect(updateButton).not.toBeDisabled();
    });
  });

  it('muestra las secciones de gestión correctamente', async () => {
    renderDashboard();

    await waitFor(() => {
      // Verificar secciones de gestión
      expect(screen.getByText('Gestión de Personal')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Contenido')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Pacientes')).toBeInTheDocument();
    });
  });

  it('permite la navegación a través de los accesos rápidos', async () => {
    renderDashboard();

    await waitFor(() => {
      // Verificar accesos rápidos
      expect(screen.getByText('Calendario')).toBeInTheDocument();
      expect(screen.getByText('Reportes')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('Mensajes')).toBeInTheDocument();
      expect(screen.getByText('Actividad')).toBeInTheDocument();
    });

    // Simular clic en un acceso rápido
    fireEvent.click(screen.getByText('Calendario'));
    // La navegación será manejada por React Router
  });

  test('muestra el indicador de carga inicialmente', () => {
    renderDashboard();
    
    // Verificar que se muestre el spinner de carga
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
}); 