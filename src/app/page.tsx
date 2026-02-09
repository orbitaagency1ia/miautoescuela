'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCard } from '@/components/home/FeatureCard';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialCard';
import { CTASection } from '@/components/home/CTASection';
import { Navbar } from '@/components/layout/Navbar';
import { PremiumFooter } from '@/components/layout/PremiumFooter';
import { TrustedBySection } from '@/components/home/TrustedBySection';
import {
  Video,
  Users,
  Trophy,
  Shield,
  Zap,
  MessageSquare,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Video,
      title: 'Contenido Multimedia',
      description: 'Sube y organiza videos de lecciones con un sistema intuitivo de gestión.',
    },
    {
      icon: Users,
      iconBg: 'from-blue-500 to-blue-600',
      title: 'Gestión de Alumnos',
      description: 'Invita alumnos por correo y haz seguimiento detallado de su progreso.',
    },
    {
      icon: Trophy,
      iconBg: 'from-yellow-500 to-orange-500',
      title: 'Gamificación',
      description: 'Sistema de puntos, logros y leaderboard para mantener a los alumnos motivados.',
    },
    {
      icon: Shield,
      iconBg: 'from-green-500 to-emerald-600',
      title: '100% Seguro',
      description: 'Datos aislados por autoescuela con encriptación de grado militar.',
    },
    {
      icon: Zap,
      iconBg: 'from-purple-500 to-violet-600',
      title: 'Fácil de Usar',
      description: 'Interfaz intuitiva en español. Sin curva de aprendizaje.',
    },
    {
      icon: MessageSquare,
      iconBg: 'from-pink-500 to-rose-600',
      title: 'Foro Integrado',
      description: 'Comunidad donde alumnos y profesores interactúan y resuelven dudas.',
    },
  ];

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        backgroundColor: '#FFFFFF',
      }}
      className="min-h-screen"
    >
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* Features Section */}
      <section id="features" className="py-32 px-6" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
              style={{ color: '#000000' }}
            >
              Todo lo que necesitas
            </h2>
            <p
              className="text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: '#1A1A1A' }}
            >
              Diseñado específicamente para autoescuelas modernas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                iconBg={feature.iconBg}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      <PremiumFooter />
    </div>
  );
}
