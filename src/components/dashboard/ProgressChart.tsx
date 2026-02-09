'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressData {
  label: string;
  value: number;
  color?: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  title?: string;
  showTrend?: boolean;
  delay?: number;
}

export function ProgressChart({
  data,
  title = 'Progreso General',
  showTrend = true,
  delay = 0,
}: ProgressChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const totalProgress = data.reduce((sum, item) => sum + item.value, 0);
  const avgProgress = data.length > 0 ? Math.round(totalProgress / data.length) : 0;

  return (
    <Card
      ref={cardRef}
      className={cn(
        'border-2 shadow-premium overflow-hidden transition-all duration-500 hover:shadow-premium-lg',
        'hover:scale-[1.01]'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          {showTrend && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">{avgProgress}%</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Overall Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Background ring */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--color-muted))"
                strokeWidth="8"
                className="opacity-20"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (isVisible ? avgProgress / 100 : 0))}`}
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(var(--color-primary) / 0.3))',
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--color-primary))" />
                  <stop offset="100%" stopColor="hsl(var(--color-secondary))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums">{avgProgress}%</span>
              <span className="text-xs text-muted-foreground">Promedio</span>
            </div>

            {/* Animated glow ring */}
            {isVisible && (
              <div
                className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"
                style={{ animationDuration: '3s' }}
              />
            )}
          </div>
        </div>

        {/* Individual Progress Bars */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="space-y-2 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    'font-medium transition-all duration-200',
                    hoveredIndex === index && 'text-primary'
                  )}
                >
                  {item.label}
                </span>
                <span className="font-semibold text-muted-foreground tabular-nums">
                  {item.value}%
                </span>
              </div>

              {/* Progress bar container */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                {/* Animated progress bar */}
                <div
                  className={cn(
                    'absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out',
                    'group-hover:shadow-lg'
                  )}
                  style={{
                    width: isVisible ? `${item.value}%` : '0%',
                    background: item.color
                      ? item.color
                      : 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))',
                    transitionDelay: `${index * 150}ms`,
                    boxShadow: hoveredIndex === index
                      ? '0 0 12px hsl(var(--color-primary) / 0.5)'
                      : 'none',
                  }}
                />

                {/* Shimmer effect */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                    'animate-shimmer-premium opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  )}
                />

                {/* Particles on hover */}
                {hoveredIndex === index && isVisible && (
                  <>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping"
                      style={{ left: `${item.value}%` }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <style>{`
        @keyframes shimmer-premium {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-premium {
          animation: shimmer-premium 1.5s ease-out infinite;
        }
      `}</style>
    </Card>
  );
}

// Mini progress widget for dashboards
export function MiniProgressWidget({
  title,
  progress,
  icon: Icon,
  color = 'primary',
  delay = 0,
}: {
  title: string;
  progress: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
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

    const duration = 1500;
    const steps = 50;
    const increment = progress / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= progress) {
        setCount(progress);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, progress]);

  return (
    <div
      ref={ref}
      className="p-4 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: `hsl(var(--color-${color}) / 0.1)` }}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <span className="font-medium text-sm">{title}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tabular-nums" style={{ color: `hsl(var(--color-${color}))` }}>
            {count}%
          </span>
          <span className="text-xs text-muted-foreground">Completado</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{
              width: isVisible ? `${count}%` : '0%',
              background: `linear-gradient(90deg, hsl(var(--color-${color})), hsl(var(--color-${color}) / 0.7))`,
            }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
