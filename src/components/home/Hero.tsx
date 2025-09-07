import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-blue-600 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Equipo de profesionales"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-28 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Instituto de Psicología Profesional de Argentina
          </h1>
          
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
            Un equipo de profesionales dedicados a promover la salud mental y el bienestar emocional a través de un enfoque integrador y basado en evidencia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contacto" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Solicitar consulta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;