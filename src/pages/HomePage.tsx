import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  BoltIcon, 
  HeartIcon, 
  ChatBubbleBottomCenterTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Modal from '../components/Modal';

const carouselImages = [
  '/images/carousel/1750306267929-286719260.jpg',
  '/images/carousel/1750306702236-738466208.png',
  '/images/carousel/1750306719893-596885016.png',
];

function useCarousel(length, interval = 3500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % length), interval);
    return () => clearInterval(id);
  }, [length, interval]);
  return index;
}

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const current = useCarousel(carouselImages.length, 3500);

  const [aboutExpanded, setAboutExpanded] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="space-y-24">
        {/* Hero Section */}
        <section className="relative w-full flex justify-center items-center bg-white" style={{ minHeight: '340px' }}>
          {/* Carrusel tipo banner animado */}
          <div className="absolute inset-0 w-full h-full overflow-hidden rounded-b-3xl shadow-lg">
            {carouselImages.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`Carrusel ${i + 1}`}
                className={`w-full h-full object-cover object-center transition-opacity duration-1000 absolute inset-0 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                style={{ minHeight: '340px', maxHeight: '400px' }}
              />
            ))}
          </div>
          {/* Logo grande sobre el carrusel */}
          <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8 mt-8">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-white/60 blur-xl z-0"></div>
            <img
              src="/images/logo 2.png"
              alt="Logo IPPL"
              className="w-[500px] max-w-full object-contain drop-shadow-2xl relative z-10"
            />
          </div>
        </section>
        {/* El resto del contenido va debajo del carrusel */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 max-w-xl lg:max-w-2xl mx-auto lg:mx-0" data-aos="fade-right">
              <h2 className="text-2xl font-bold text-[#006C73] mb-2 font-sans">¿QUIENES SOMOS?</h2>
              <div className="text-gray-700 text-[1.08rem] leading-relaxed font-sans" style={{fontFamily: 'Inter, Roboto, Nunito, sans-serif'}}>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${aboutExpanded ? 'max-h-screen' : 'max-h-24'}`}>
                  {fullAboutText.map((t, i) => <p key={i} className="mb-3 text-gray-700">{t}</p>)}
                </div>
                <button onClick={() => setAboutExpanded(!aboutExpanded)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm shadow hover:bg-blue-700 transition-all">
                  {aboutExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link
                  to="/contacto"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-[#006C73] hover:bg-[#00078A] shadow-lg hover:shadow-[#80C0D0]/30 transition-all duration-200 transform hover:scale-110 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006C73]"
                  data-aos="zoom-in"
                >
                  Solicitar consulta
                </Link>
                <Link
                  to="/profesionales"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-[#006C73] bg-[#F9FAFB] hover:bg-[#80C0D0] shadow-lg hover:shadow-[#80C0D0]/20 transition-all duration-200 border-2 border-[#80C0D0] transform hover:scale-110 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#80C0D0]"
                  data-aos="zoom-in"
                >
                  Conocer profesionales
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-6 w-full" data-aos="fade-left">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#80C0D0] bg-white w-full max-w-xl aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/Ma2HjKwul0Y" 
                  title="YouTube video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#374151] sm:text-4xl">Nuestros Servicios</h2>
            <p className="mt-4 text-xl text-[#006C73]">Ofrecemos una amplia gama de servicios psicológicos adaptados a las necesidades de cada persona.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => (
              <div
                key={service.name}
                className="relative group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                data-aos="zoom-in-up"
                data-aos-delay={idx * 100}
              >
                <div className="inline-flex items-center justify-center p-3 bg-[#80C0D0] rounded-xl">
                  <service.icon className="h-6 w-6 text-[#006C73]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#374151]">{service.name}</h3>
                <p className="mt-2 text-[#006C73]">{service.description}</p>
                <Link
                  to={service.link}
                  className="mt-4 inline-flex items-center text-[#006C73] hover:text-[#00078A] transition-all duration-200 transform hover:scale-110 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#80C0D0]"
                >
                  Saber más
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white" data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#374151] sm:text-4xl">¿Por qué elegirnos?</h2>
              <p className="mt-4 text-xl text-[#006C73]">Nuestro compromiso es brindar atención psicológica de calidad con un enfoque personalizado.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <div
                  key={feature.name}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                  data-aos="zoom-in"
                  data-aos-delay={idx * 100}
                >
                  <div className="inline-flex items-center justify-center p-2 bg-[#80C0D0] rounded-lg">
                    <feature.icon className="h-6 w-6 text-[#006C73]" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-[#374151]">{feature.name}</h3>
                  <p className="mt-2 text-sm text-[#006C73]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-[#006C73] py-20" data-aos="fade-up">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Comienza tu camino hacia el bienestar</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Nuestro equipo de profesionales está listo para acompañarte en tu proceso terapéutico.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="/contacto" className="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-white text-[#006C73] hover:bg-gray-200 transition-all shadow-lg transform hover:scale-105">Agenda tu consulta</a>
              <a href="/profesionales" className="inline-block px-8 py-3 text-lg font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-[#006C73] transition-all transform hover:scale-105">Conocer Profesionales</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const services = [
  {
    name: 'Terapia Individual',
    description: 'Sesiones personalizadas para abordar tus necesidades específicas en un espacio seguro y confidencial.',
    icon: UserGroupIcon,
    link: '/servicios#individual'
  },
  {
    name: 'Terapia de Pareja',
    description: 'Ayudamos a fortalecer la comunicación y resolver conflictos en la relación.',
    icon: HeartIcon,
    link: '/servicios#pareja'
  },
  {
    name: 'Coaching Personal',
    description: 'Acompañamiento para alcanzar tus metas y desarrollar tu máximo potencial.',
    icon: BoltIcon,
    link: '/servicios#coaching'
  }
];

const features = [
  {
    name: 'Profesionales Certificados',
    description: 'Equipo altamente calificado con amplia experiencia.',
    icon: UserGroupIcon
  },
  {
    name: 'Atención Personalizada',
    description: 'Tratamientos adaptados a tus necesidades específicas.',
    icon: ChatBubbleBottomCenterTextIcon
  },
  {
    name: 'Enfoque Integral',
    description: 'Abordaje holístico para tu bienestar emocional.',
    icon: HeartIcon
  },
  {
    name: 'Resultados Comprobados',
    description: 'Metodologías basadas en evidencia científica.',
    icon: BoltIcon
  }
];

const fullAboutText = [
  "Somos un grupo de profesionales de la salud y la educación que creemos en el trabajo en equipo, en la ética de nuestra profesión y en la formación continua.",
  "Nuestra caja de herramientas en permanente construcción nos permite dar más y mejores respuestas a las situaciones que se nos presentan.",
  "El psicoanálisis vincular nos plantea un abordaje posible frente al desafío de la teoría y la clínica hoy.",
  "Sostenemos la necesidad de una revisión y reformulación de las teorías existentes y del psicoanálisis en particular que nos permita nuevas enunciaciones y dispositivos, con una mirada desde la complejidad, con una perspectiva transdisciplinaria, histórica, sociológica, jurídica, antropológica, semiótica.",
  "El compromiso y la fidelidad es no para con una teoría, sino para con nuestros pacientes, consultantes y estudiantes."
];

const aboutSummary = fullAboutText[0];

export default HomePage;