import React from 'react';
import { Heart, Users, Brain, UserSearch, BookOpen, Video } from 'lucide-react';
import Card from '../common/Card';

interface ServiceProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ServiceCard: React.FC<ServiceProps> = ({ title, description, icon }) => {
  return (
    <Card className="h-full transition-transform hover:-translate-y-1 duration-200">
      <div className="flex flex-col items-center text-center p-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
          {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-primary' })}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Card>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      title: 'Terapia Individual',
      description: 'Acompañamiento personalizado para abordar dificultades emocionales, relacionales o adaptativas.',
      icon: <Heart size={24} />,
    },
    {
      title: 'Terapia de Pareja',
      description: 'Mediación y herramientas para mejorar la comunicación y resolver conflictos en la relación.',
      icon: <Users size={24} />,
    },
    {
      title: 'Evaluación Psicológica',
      description: 'Diagnóstico profesional mediante tests y entrevistas para comprender mejor cada situación.',
      icon: <Brain size={24} />,
    },
    {
      title: 'Orientación Vocacional',
      description: 'Descubrimiento de aptitudes e intereses para elegir un camino profesional satisfactorio.',
      icon: <UserSearch size={24} />,
    },
    {
      title: 'Terapia Familiar',
      description: 'Intervención sistémica para restablecer la armonía y la comunicación en el núcleo familiar.',
      icon: <BookOpen size={24} />,
    },
    {
      title: 'Consultas Online',
      description: 'Atención psicológica a distancia con la misma calidad y confidencialidad que las sesiones presenciales.',
      icon: <Video size={24} />,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios psicológicos adaptados a las necesidades de cada persona.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;