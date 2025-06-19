import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  image?: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "La terapia en IPPL me ayudó a superar un momento muy difícil de mi vida. La profesionalidad y calidez con la que fui atendida hicieron toda la diferencia.",
      author: "Laura M.",
      location: "Buenos Aires",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      quote: "Después de meses de ansiedad, encontré en IPPL las herramientas que necesitaba para gestionar mis emociones. Mi psicólogo me acompañó en todo el proceso con mucha dedicación.",
      author: "Martín G.",
      location: "Córdoba",
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      quote: "La orientación vocacional que recibí me ayudó a descubrir mi verdadera pasión. Ahora estoy estudiando lo que realmente me gusta, y me siento muy agradecida por el apoyo recibido.",
      author: "Valentina S.",
      location: "Rosario",
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-12 sm:py-16 bg-teal-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Testimonios</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Historias de personas que han transformado sus vidas a través de nuestros servicios.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-teal-500">
              <Quote size={32} className="sm:w-10 sm:h-10" />
            </div>
            
            <div className="pt-6 sm:pt-8 md:pl-12">
              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 italic">
                "{testimonials[currentIndex].quote}"
              </p>
              
              <div className="flex items-center">
                {testimonials[currentIndex].image && (
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].author}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">{testimonials[currentIndex].author}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              onClick={prevTestimonial}
              className="mx-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
              aria-label="Testimonio anterior"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            
            <div className="flex items-center mx-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${
                    currentIndex === index ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextTestimonial}
              className="mx-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
              aria-label="Siguiente testimonio"
            >
              <ArrowRight size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;