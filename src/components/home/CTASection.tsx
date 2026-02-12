'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export function CTASection() {
  const trustElements = [
    { icon: CheckCircle, text: 'Sin tarjeta de crédito' },
    { icon: CheckCircle, text: 'Configuración en 5 minutos' },
    { icon: CheckCircle, text: 'Soporte 24/7' },
  ];

  return (
    <section className="relative py-24 px-6 bg-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-8">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">EMPIEZA HOY MISMO</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-slate-900">
          ¿Listo para modernizar
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            tu autoescuela?
          </span>
        </h2>

        {/* Subheadline */}
        <p className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-slate-600">
          Únete a las autoescuelas que ya están transformando su enseñanza.
          <br />
          <span className="font-semibold text-slate-900">
            Prueba gratis 14 días. Sin compromiso.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
          <Link href="/registro">
            <Button
              size="lg"
              className="h-16 px-10 rounded-full text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"
            >
              Comenzar prueba gratis
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

        {/* Trust Elements */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {trustElements.map((element, index) => {
            const Icon = element.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-slate-600">
                <Icon className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">{element.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
