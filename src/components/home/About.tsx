import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { CheckCircle } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    'Compromiso con la ética profesional',
    'Enfoque basado en evidencia científica',
    'Formación continua y actualización',
    'Atención personalizada y empática',
    'Confidencialidad absoluta',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Quiénes Somos</h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              El Instituto de Psicología Profesional de Argentina (IPPL) es una institución dedicada a la promoción de la salud mental, formada por un equipo interdisciplinario de profesionales comprometidos con el bienestar psicológico.
            </p>
            
            <p className="text-gray-600 mb-8 text-lg">
              Desde nuestra fundación, hemos acompañado a miles de personas en su proceso terapéutico, brindando herramientas para afrontar los desafíos de la vida cotidiana y desarrollar una mejor calidad de vida.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nuestros valores</h3>
            
            <ul className="space-y-3 mb-8">
              {values.map((value, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle size={20} className="text-[#00B19F] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{value}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/nosotros">
              <Button variant="primary">
                Conocer más sobre nosotros
              </Button>
            </Link>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.pexels.com/photos/7176305/pexels-photo-7176305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Profesional de IPPL"
                  className="rounded-lg shadow-md h-48 w-full object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Sesión terapéutica"
                  className="rounded-lg shadow-md h-64 w-full object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.pexels.com/photos/7176325/pexels-photo-7176325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Consultorio IPPL"
                  className="rounded-lg shadow-md h-64 w-full object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/6005465/pexels-photo-6005465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Equipo de profesionales"
                  className="rounded-lg shadow-md h-48 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;