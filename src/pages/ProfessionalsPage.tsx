import React, { useEffect } from 'react';
import { UserIcon, AcademicCapIcon, BriefcaseIcon, StarIcon } from '@heroicons/react/24/outline';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ProfessionalsPage = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const professionals = [
    {
      id: 1,
      name: "Dra. María González",
      title: "Psicóloga Clínica",
      specialties: ["Terapia Individual", "Ansiedad", "Depresión"],
      experience: "15 años de experiencia",
      education: "Doctorado en Psicología Clínica",
      image: "/img/professionals/maria.jpg"
    },
    {
      id: 2,
      name: "Dr. Carlos Rodríguez",
      title: "Psicólogo Infantil",
      specialties: ["Psicología Infantil", "Terapia Familiar", "TDAH"],
      experience: "12 años de experiencia",
      education: "Máster en Psicología Infantil",
      image: "/img/professionals/carlos.jpg"
    },
    {
      id: 3,
      name: "Dra. Ana Martínez",
      title: "Psicoterapeuta",
      specialties: ["Terapia de Pareja", "Trauma", "Autoestima"],
      experience: "10 años de experiencia",
      education: "Especialización en Terapia de Pareja",
      image: "/img/professionals/ana.jpg"
    }
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <h1 className="text-4xl font-extrabold text-[#374151] sm:text-5xl md:text-6xl">
            Nuestros Profesionales
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-[#006C73] sm:mt-4">
            Conoce a nuestro equipo de expertos profesionales dedicados a tu bienestar mental
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional, idx) => (
            <div
              key={professional.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              data-aos="zoom-in-up"
              data-aos-delay={idx * 100}
            >
              <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Professional';
                  }}
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{professional.name}</h3>
                <p className="text-lg text-[#006C73] mb-4">{professional.title}</p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-6 w-6 text-[#00796B]" />
                    <span className="ml-2 text-gray-600">{professional.education}</span>
                  </div>

                  <div className="flex items-center">
                    <BriefcaseIcon className="h-6 w-6 text-[#00796B]" />
                    <span className="ml-2 text-gray-600">{professional.experience}</span>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <StarIcon className="h-6 w-6 text-[#00796B]" />
                      <span className="ml-2 text-gray-700 font-medium">Especialidades:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {professional.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#E0F2F1] text-[#00796B] rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-6 w-full bg-[#00796B] text-white py-2 px-4 rounded-lg hover:bg-[#006C73] transition-colors duration-200">
                  Agendar Cita
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsPage; 