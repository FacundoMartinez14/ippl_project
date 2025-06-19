import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../LoginPage';

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    window.localStorage.clear();
  });

  it('renderiza el formulario de login correctamente', () => {
    renderLoginPage();
    
    // Verificar que los elementos principales estén presentes
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra error cuando los campos están vacíos', async () => {
    renderLoginPage();
    
    // Intentar enviar el formulario sin datos
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);
    
    // Verificar que se muestren los mensajes de error
    await waitFor(() => {
      expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('maneja el envío del formulario correctamente', async () => {
    renderLoginPage();
    
    // Simular entrada de datos
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Simular envío del formulario
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);
    
    // Verificar que se muestre el indicador de carga
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('muestra el botón de mostrar/ocultar contraseña', () => {
    renderLoginPage();
    
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    
    // Verificar que la contraseña esté oculta inicialmente
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Mostrar contraseña
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Ocultar contraseña
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
}); 