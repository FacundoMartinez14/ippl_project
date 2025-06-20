import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactCTA = () => {
  return (
    <section className="bg-[#00777e] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Comienza tu camino hacia el bienestar
        </h2>
        <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
          Nuestro equipo de profesionales está listo para acompañarte en tu proceso terapéutico.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Link
            to="/contacto"
            className="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-white text-[#00777e] hover:bg-gray-100 transition-colors"
          >
            Agenda tu consulta
          </Link>
          <Link
            to="/profesionales"
            className="inline-block px-8 py-3 text-lg font-semibold rounded-full text-white border-2 border-white hover:bg-white hover:text-[#00777e] transition-colors"
          >
            Conocer Profesionales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;