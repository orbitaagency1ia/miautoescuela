'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#FFFFFF',
      }}
      className="relative min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-12"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <span className="text-sm font-medium" style={{ color: '#059669' }}>
            PLATAFORMA #1 PARA AUTOESCUELAS
          </span>
        </div>

        {/* Main Headline - Apple Style */}
        <h1
          className="text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-tight mb-8 leading-[1.05]"
          style={{ color: '#000000' }}
        >
          Gestiona tu<br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            autoescuela
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-2xl sm:text-3xl max-w-3xl mx-auto mb-16 leading-relaxed font-light"
          style={{ color: '#1A1A1A' }}
        >
          La plataforma completa para gestionar alumnos, contenidos y seguimiento.
        </p>

        {/* CTA Buttons - Apple Style */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link href="/registro">
            <Button
              size="lg"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '1.75rem 2.5rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              className="text-lg font-medium transition-all hover:scale-105 hover:shadow-xl"
            >
              Comenzar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/panel">
            <Button
              size="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                padding: '1.75rem 2.5rem',
                borderRadius: '1rem',
              }}
              className="text-lg font-medium transition-all duration-300 hover:scale-105 hover:!bg-white hover:!text-black"
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                style={{ borderColor: '#FFFFFF' }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-lg" style={{ color: '#1A1A1A' }}>
            <span className="font-semibold" style={{ color: '#000000' }}>
              +500 autoescuelas
            </span>{' '}
            confían en nosotros
          </p>
        </div>
      </div>
    </section>
  );
}
