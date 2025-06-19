import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-4">IPPL</h3>
            <p className="text-blue-100 mb-4">
              Instituto de Psicología profesional comprometido con la salud mental y el bienestar emocional.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-blue-100 hover:text-white transition-colors">Nosotros</Link>
              </li>
              <li>
                <Link to="/profesionales" className="text-blue-100 hover:text-white transition-colors">Profesionales</Link>
              </li>
              <li>
                <Link to="/servicios" className="text-blue-100 hover:text-white transition-colors">Servicios</Link>
              </li>
              <li>
                <Link to="/blog" className="text-blue-100 hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contacto" className="text-blue-100 hover:text-white transition-colors">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li className="text-blue-100">Terapia individual</li>
              <li className="text-blue-100">Terapia de pareja</li>
              <li className="text-blue-100">Terapia familiar</li>
              <li className="text-blue-100">Evaluación psicológica</li>
              <li className="text-blue-100">Orientación vocacional</li>
              <li className="text-blue-100">Atención online</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-blue-300 flex-shrink-0 mt-1" />
                <span className="text-blue-100">Av. Rivadavia 1234, Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">+54 11 5555-5555</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">contacto@ippl.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-200 text-sm">
          <p>&copy; {new Date().getFullYear()} IPPL - Instituto de Psicología. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;