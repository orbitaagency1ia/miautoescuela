'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  label: string;
  iconBg?: string;
}

function StatItem({ icon: Icon, value, suffix = '', label, iconBg = 'from-blue-500 to-blue-600' }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 50;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 border-slate-100 hover:border-slate-200">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-50/0 to-blue-50/0 group-hover:from-slate-50/50 group-hover:to-blue-50/50 transition-all duration-300 pointer-events-none" />
      <div className="relative">
        <div className={cn(
          "w-16 h-16 rounded-2xl bg-gradient-to-br shadow-md flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
          iconBg
        )}>
          <Icon className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
        <div className="flex items-baseline justify-center gap-1 mb-3">
          <span className="text-5xl font-bold tabular-nums text-slate-900">
            {count}
          </span>
          {suffix && (
            <span className="text-2xl font-semibold text-slate-400">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export function StatsSection() {
  const { Users, BookOpen, GraduationCap, Star } = require('lucide-react');

  const stats = [
    { icon: Users, value: 5000, suffix: '+', label: 'Alumnos Activos', iconBg: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, value: 500, suffix: '+', label: 'Contenidos', iconBg: 'from-emerald-500 to-emerald-600' },
    { icon: GraduationCap, value: 98, suffix: '%', label: 'Tasa de Aprobación', iconBg: 'from-violet-500 to-violet-600' },
    { icon: Star, value: 4.9, suffix: '/5', label: 'Valoración Media', iconBg: 'from-amber-500 to-amber-600' },
  ];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 mb-8">
            <Star className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">ESTADÍSTICAS REALES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900">
            Números que
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}importan
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-slate-600">
            Resultados reales de miles de autoescuelas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <StatItem {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
