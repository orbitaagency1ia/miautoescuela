'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Car, Shield, Zap, Award, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-slate-700">
            PLATAFORMA #1 PARA AUTOESCUELAS
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05] animate-fade-in" style={{ animationDelay: '100ms' }}>
          Gestiona tu
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            autoescuela
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-2xl sm:text-3xl max-w-3xl mx-auto mb-12 leading-relaxed text-slate-700 animate-fade-in" style={{ animationDelay: '200ms' }}>
          La plataforma completa para gestionar alumnos, contenidos y seguimiento.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-sm text-slate-700">
            <Car className="h-4 w-4 text-blue-600" />
            <span>Contenido Multimedia</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-sm text-slate-700">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Gestión de Alumnos</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-sm text-slate-700">
            <Award className="h-4 w-4 text-amber-600" />
            <span>Gamificación</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Link href="/registro">
            <Button
              size="lg"
              className="h-16 px-10 rounded-full text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"
            >
              Comenzar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/panel">
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 rounded-full text-lg font-semibold border-2 border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-slate-400 transition-all duration-300 hover:scale-105"
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col items-center gap-5 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex -space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center text-sm font-bold bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg"
                style={{ zIndex: 5 - i }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-lg text-slate-700">
            <span className="font-bold text-slate-900">+500 autoescuelas</span> confían en nosotros
          </p>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-600" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
