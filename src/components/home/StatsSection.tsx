'use client';

import { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  label: string;
}

function StatItem({ icon: Icon, value, suffix = '', label }: StatItemProps) {
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
    <div ref={ref} className="text-center">
      <Icon
        className="h-10 w-10 mx-auto mb-6"
        style={{ color: '#9CA3AF' }}
        strokeWidth={1.5}
      />
      <div className="flex items-baseline justify-center gap-1 mb-3">
        <span
          className="text-7xl sm:text-8xl font-semibold tracking-tight tabular-nums"
          style={{ color: '#000000' }}
        >
          {count}
        </span>
        {suffix && (
          <span
            className="text-4xl sm:text-5xl font-semibold"
            style={{ color: '#9CA3AF' }}
          >
            {suffix}
          </span>
        )}
      </div>
      <p className="text-xl font-medium" style={{ color: '#1A1A1A' }}>
        {label}
      </p>
    </div>
  );
}

export function StatsSection() {
  const { Users, BookOpen, GraduationCap, Star } = require('lucide-react');

  const stats = [
    { icon: Users, value: 5000, suffix: '+', label: 'Alumnos Activos' },
    { icon: BookOpen, value: 500, suffix: '+', label: 'Contenidos' },
    { icon: GraduationCap, value: 98, suffix: '%', label: 'Tasa de Aprobación' },
    { icon: Star, value: 4.9, suffix: '/5', label: 'Valoración Media' },
  ];

  return (
    <section
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#FFFFFF',
      }}
      className="py-40 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
            style={{ color: '#000000' }}
          >
            Números que
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {' '}importan
            </span>
          </h2>
          <p
            className="text-2xl max-w-2xl mx-auto"
            style={{ color: '#1A1A1A' }}
          >
            Resultados reales de miles de autoescuelas
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-20">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
