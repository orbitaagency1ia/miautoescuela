'use client';

import {
  Users,
  BookOpen,
  Play,
  TrendingUp,
  Sparkles,
  Flame,
  Target,
  Zap,
  Award,
  Settings,
  Palette,
  BarChart3,
  LucideIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Map of icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  'book-open': BookOpen,
  play: Play,
  'trending-up': TrendingUp,
  sparkles: Sparkles,
  flame: Flame,
  target: Target,
  zap: Zap,
  award: Award,
  settings: Settings,
  palette: Palette,
  'bar-chart-3': BarChart3,
};

interface AnimatedStatCardProps {
  title: string;
  value: number | string;
  description: string;
  iconName: string;
  gradient: string;
  bgGlow: string;
  delay?: number;
  trend?: string;
  suffix?: string;
}

export function AnimatedStatCard({
  title,
  value,
  description,
  iconName,
  gradient,
  bgGlow,
  delay = 0,
  trend,
  suffix = '',
}: AnimatedStatCardProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get the icon component from the map
  const Icon = iconMap[iconName] || Sparkles;

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

  useEffect(() => {
    if (!isVisible) return;

    const targetValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const tiltX = ((mousePosition.y - 50) / 50) * 2;
  const tiltY = ((mousePosition.x - 50) / 50) * -2;

  const displayValue = typeof value === 'string' && value.includes('%')
    ? `${count}%`
    : suffix
      ? `${count}${suffix}`
      : count;

  return (
    <Card
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden border-2 transition-all duration-500 cursor-default',
        'hover:shadow-premium-lg',
      )}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        animationDelay: `${delay}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 50, y: 50 });
      }}
    >
      {/* Dynamic Gradient Overlay */}
      <div
        className="absolute inset-0 rounded-lg transition-opacity duration-500"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--color-primary) / 0.08), transparent 60%)`
            : 'transparent',
        }}
      />

      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div
          className="absolute inset-0 rounded-lg animate-gradient-rotate"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--color-primary) / 0.4), transparent, hsl(var(--color-secondary) / 0.4), transparent, hsl(var(--color-primary) / 0.4))',
            filter: 'blur(8px)',
            backgroundSize: '300% 300%',
          }}
        />
      </div>

      <CardContent className="relative p-6" style={{ transform: 'translateZ(10px)' }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold tracking-tight tabular-nums">
                {displayValue}
              </p>
              {trend && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold animate-pulse">
                  {trend}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>

            {/* Mini progress bar */}
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: isVisible ? `${Math.min((count / (typeof value === 'number' ? value : 100)) * 100, 100)}%` : '0%',
                  background: `linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))`,
                }}
              />
            </div>
          </div>

          {/* Animated Icon */}
          <div className="relative">
            {/* Glow effect */}
            <div
              className={cn(
                'absolute inset-0 rounded-2xl blur-xl transition-all duration-500',
                bgGlow
              )}
              style={{
                opacity: isHovered ? 1 : 0.5,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            {/* Icon container */}
            <div
              className={cn(
                'relative p-3 rounded-2xl transition-all duration-300',
                bgGlow
              )}
              style={{
                transform: isHovered ? 'scale(1.1) rotate(6deg)' : 'scale(1)',
              }}
            >
              <Icon className={cn('h-6 w-6 bg-gradient-to-br bg-clip-text text-transparent', gradient)} />
            </div>

            {/* Floating particles on hover */}
            {isHovered && (
              <>
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <div className="absolute -bottom-1 left-1 w-1 h-1 rounded-full bg-secondary animate-ping" style={{ animationDelay: '0.2s' }} />
              </>
            )}
          </div>
        </div>
      </CardContent>

      <style>{`
        @keyframes gradient-rotate {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-rotate {
          animation: gradient-rotate 3s ease infinite;
        }
      `}</style>
    </Card>
  );
}
