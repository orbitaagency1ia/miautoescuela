'use client';

import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarBg?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  const { name, role, company, content, rating, avatarBg = 'from-blue-500 to-blue-600' } = testimonial;

  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 border-slate-100 hover:border-slate-200">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-50/0 to-blue-50/0 group-hover:from-slate-50/50 group-hover:to-blue-50/50 transition-all duration-300 pointer-events-none" />
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote className="h-16 w-16 text-slate-900" />
      </div>

      <div className="relative">
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5 transition-colors",
                i < rating ? "text-amber-500 fill-amber-500" : "text-slate-300"
              )}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-lg leading-relaxed mb-8 text-slate-700">
          "{content}"
        </p>

        {/* Author Section */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md",
            "bg-gradient-to-br " + avatarBg
          )}>
            {name.split(' ').map(n => n[0]).join('')}
          </div>

          <div>
            <p className="font-bold text-slate-900">{name}</p>
            <p className="text-sm text-slate-500">
              {role} · <span className="text-blue-600">{company}</span>
            </p>
          </div>
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
      avatarBg: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Gerente',
      company: 'Conduce Bien',
      content: 'La gamificación ha transformado nuestra forma de enseñar. Los alumnos están más motivados y aprobamos más que nunca. ¡Increíble!',
      rating: 5,
      avatarBg: 'from-emerald-500 to-emerald-600',
    },
    {
      name: 'Laura Martínez',
      role: 'Propietaria',
      company: 'Autoescuela Vía Libre',
      content: 'Todo lo que necesitamos en un solo lugar. Contenidos, seguimiento, foro... Nuestra productividad ha mejorado significativamente.',
      rating: 5,
      avatarBg: 'from-violet-500 to-violet-600',
    },
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 mb-8">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-sm font-semibold text-slate-700">TESTIMONIOS REALES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900">
            Lo que dicen
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}nuestros clientes
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-slate-600">
            Miles de autoescuelas ya confían en nosotros
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>

        {/* Trust indicator */}
        <div className="mt-16 flex flex-col items-center gap-4 p-8 rounded-[20px] bg-white/60 backdrop-blur-sm border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-6 w-6 text-amber-500 fill-amber-500"
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-lg font-semibold text-slate-700">
            Valoración media basada en +500 reseñas verificadas
          </p>
        </div>
      </div>
    </section>
  );
}
