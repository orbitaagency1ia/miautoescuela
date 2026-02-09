'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#FFFFFF',
      }}
      className="py-40 px-6"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Headline */}
        <h2
          className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-8 leading-[1.1]"
          style={{ color: '#000000' }}
        >
          ¿Listo para modernizar
          <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            tu autoescuela?
          </span>
        </h2>

        {/* Subheadline */}
        <p
          className="text-2xl max-w-2xl mx-auto mb-16 leading-relaxed"
          style={{ color: '#1A1A1A' }}
        >
          Únete a las autoescuelas que ya están transformando su enseñanza.
          <br />
          <span className="font-semibold" style={{ color: '#000000' }}>
            Prueba gratis 14 días. Sin compromiso.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/registro">
            <Button
              size="lg"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '2rem 3rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              className="text-xl font-medium transition-all hover:scale-105 hover:shadow-xl"
            >
              Comenzar prueba gratis
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>

          <Link href="/panel">
            <Button
              size="lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                border: '2px solid #E5E7EB',
                color: '#1A1A1A',
                padding: '2rem 3rem',
                borderRadius: '1rem',
              }}
              className="text-xl font-medium transition-all duration-300 hover:scale-105 hover:!bg-white hover:!text-black hover:!border-black"
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Trust Elements - Checks verdes brillantes visibles */}
        <div
          className="flex flex-wrap items-center justify-center gap-8 mt-16"
          style={{ color: '#4B5563' }}
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span style={{ color: '#1A1A1A' }}>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span style={{ color: '#1A1A1A' }}>Configuración en 5 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span style={{ color: '#1A1A1A' }}>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
