import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({
        username: formData.username,
        password: formData.password
      });
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      toast.success('¡Bienvenido!');
      
      // Redirigir según el rol
      switch (currentUser.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'content_manager':
          navigate('/content');
          break;
        case 'professional':
          navigate('/professional');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      toast.error(error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-white">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo y texto inicial */}
          <div className="mb-12">
            <Link to="/" className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#00796B] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">IP</span>
                </div>
                <span className="text-xl font-bold text-gray-800">IPPL</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm mb-2">Inicia tu experiencia</p>
            <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión IPPL</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm text-gray-500 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="email"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B]"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-500 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B]"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#00796B] text-white py-3 rounded-lg font-medium hover:bg-[#006C73] transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>

      {/* Lado derecho - Imagen de fondo */}
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-full w-full bg-[#00796B]">
          <div className="h-full w-full bg-[url('/images/login-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;