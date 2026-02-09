'use client';

import { Star } from 'lucide-react';

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { name, role, company, content, rating } = testimonial;

  return (
    <div
      className="p-10 rounded-3xl"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      {/* Rating Stars */}
      <div className="flex items-center gap-1.5 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5"
            style={{
              fill: i < rating ? '#FBBF24' : '#D1D5DB',
              color: i < rating ? '#FBBF24' : '#D1D5DB',
            }}
            strokeWidth={1.5}
          />
        ))}
      </div>

      {/* Content */}
      <p
        className="text-xl leading-relaxed mb-10"
        style={{ color: '#000000' }}
      >
        "{content}"
      </p>

      {/* Author Section */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg bg-gradient-to-br from-blue-500 to-blue-600"
        >
          {name.split(' ').map(n => n[0]).join('')}
        </div>

        <div>
          <p className="font-semibold text-lg" style={{ color: '#000000' }}>
            {name}
          </p>
          <p style={{ color: '#4B5563' }}>
            {role} · {company}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      name: 'María García',
      role: 'Directora',
      company: 'Autoescuela Central',
      content: 'Desde que usamos mIAutoescuela, el engagement de nuestros alumnos ha aumentado un 60%. La plataforma es intuitiva y el soporte excepcional.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Gerente',
      company: 'Conduce Bien',
      content: 'La gamificación ha transformado nuestra forma de enseñar. Los alumnos están más motivados y aprobamos más que nunca. ¡Increíble!',
      rating: 5,
    },
    {
      name: 'Laura Martínez',
      role: 'Propietaria',
      company: 'Autoescuela Vía Libre',
      content: 'Todo lo que necesitamos en un solo lugar. Contenidos, seguimiento, foro... Nuestra productividad ha mejorado significativamente.',
      rating: 5,
    },
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  return (
    <section
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#F9FAFB',
      }}
      className="py-40 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
            style={{ color: '#000000' }}
          >
            Lo que dicen
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {' '}nuestros clientes
            </span>
          </h2>
          <p
            className="text-2xl max-w-2xl mx-auto"
            style={{ color: '#1A1A1A' }}
          >
            Miles de autoescuelas ya confían en nosotros
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Trust indicator */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-6 w-6"
                style={{ fill: '#FBBF24', color: '#FBBF24' }}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-lg" style={{ color: '#1A1A1A' }}>
            Valoración media basada en +500 reseñas verificadas
          </p>
        </div>
      </div>
    </section>
  );
}
