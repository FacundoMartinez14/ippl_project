import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactCTA: React.FC = () => {
  return (
    <section className="py-16 bg-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">¿Necesitas ayuda profesional?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Nuestro equipo de psicólogos especializados está listo para acompañarte en tu proceso terapéutico. Da el primer paso hacia tu bienestar.
            </p>
            
            <div className="mb-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-3 text-blue-300 flex-shrink-0 mt-1" />
                  <span className="text-blue-100">Av. Rivadavia 1234, Buenos Aires, Argentina</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-3 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100">+54 11 5555-5555</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-3 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100">contacto@ippl.org</span>
                </li>
              </ul>
            </div>
            
            <Link to="/contacto">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-700"
              >
                Solicitar una consulta
              </Button>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.331630704998!2d-58.38812662426282!3d-34.618091558280364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaea670d4e67%3A0x2198c954311ad6d9!2sAv.%20Rivadavia%2C%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sar!4v1630428572824!5m2!1ses!2sar" 
              width="100%" 
              height="400" 
              style={{ border: 0, borderRadius: '0.5rem' }} 
              allowFullScreen 
              loading="lazy"
              title="Ubicación IPPL"
              className="shadow-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;