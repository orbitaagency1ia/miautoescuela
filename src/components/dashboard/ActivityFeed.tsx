'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame, Clock, User, BookOpen, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'lesson' | 'join' | 'forum' | 'content' | 'achievement';
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
  delay?: number;
  realtime?: boolean;
}

const typeConfig = {
  lesson: { icon: BookOpen, color: 'blue', label: 'Lección' },
  join: { icon: User, color: 'green', label: 'Registro' },
  forum: { icon: MessageSquare, color: 'purple', label: 'Foro' },
  content: { icon: Plus, color: 'emerald', label: 'Contenido' },
  achievement: { icon: Sparkles, color: 'yellow', label: 'Logro' },
};

export function ActivityFeed({
  activities,
  title = 'Actividad Reciente',
  description = 'Últimas acciones en tu autoescuela',
  delay = 0,
  realtime = false,
}: ActivityFeedProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    const items = containerRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [activities]);

  const getTypeIcon = (type: ActivityItem['type']) => {
    return typeConfig[type]?.icon || Flame;
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    return typeConfig[type]?.color || 'primary';
  };

  return (
    <Card
      ref={containerRef}
      className={cn(
        'border-2 shadow-premium overflow-hidden transition-all duration-500 hover:shadow-premium-lg',
        'hover:scale-[1.01]'
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-xl transition-all duration-300',
                isHovered && 'scale-110 rotate-3'
              )}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))',
              }}
            >
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>

          {/* Animated pulse indicator for realtime */}
          {realtime && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-500">En vivo</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="p-4 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary) / 0.1), hsl(var(--color-secondary) / 0.1))',
                }}
              >
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">No hay actividad reciente</p>
              <p className="text-sm text-muted-foreground mt-1">
                Las acciones de tus alumnos aparecerán aquí
              </p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = getTypeIcon(activity.type);
              const color = getTypeColor(activity.type);
              const isVisible = visibleItems.has(index);

              return (
                <div
                  key={activity.id}
                  data-index={index}
                  className={cn(
                    'group flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-default',
                    'hover:border-primary/30 hover:shadow-md',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    borderColor: isVisible ? 'hsl(var(--color-border) / 0.5)' : 'transparent',
                  }}
                >
                  {/* Icon container */}
                  <div
                    className={cn(
                      'relative p-2 rounded-xl transition-all duration-300 mt-0.5',
                      'group-hover:scale-110 group-hover:rotate-6'
                    )}
                    style={{
                      backgroundColor: `hsl(var(--color-${color}) / 0.1)`,
                    }}
                  >
                    {/* Glow effect */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-xl blur-lg transition-all duration-300',
                        'opacity-0 group-hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: `hsl(var(--color-${color}) / 0.3)`,
                      }}
                    />

                    <Icon
                      className="h-4 w-4 relative z-10 transition-colors duration-300"
                      style={{ color: `hsl(var(--color-${color}))` }}
                    />

                    {/* Ping animation for new items */}
                    {index < 3 && isVisible && (
                      <div
                        className="absolute inset-0 rounded-xl animate-ping"
                        style={{
                          backgroundColor: `hsl(var(--color-${color}) / 0.2)`,
                          animationDuration: '2s',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium transition-all duration-200',
                        'group-hover:text-primary'
                      )}
                    >
                      {activity.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {/* Type badge */}
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                          'font-medium'
                        )}
                        style={{
                          backgroundColor: `hsl(var(--color-${color}) / 0.1)`,
                          color: `hsl(var(--color-${color}))`,
                        }}
                      >
                        {typeConfig[activity.type]?.label}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator on hover */}
                  <div
                    className={cn(
                      'opacity-0 transition-all duration-200',
                      'group-hover:opacity-100 group-hover:translate-x-0',
                      '-translate-x-2'
                    )}
                    style={{ color: 'hsl(var(--color-primary))' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View more link */}
        {activities.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1 mx-auto">
              Ver toda la actividad
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard widgets
export function CompactActivityFeed({
  activities,
  limit = 5,
  title = 'Actividad',
}: {
  activities: ActivityItem[];
  limit?: number;
  title?: string;
}) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = document.querySelectorAll('[data-compact-index]');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [activities]);

  const displayedActivities = activities.slice(0, limit);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Sin actividad reciente
        </div>
      ) : (
        <div className="space-y-2">
          {displayedActivities.map((activity, index) => {
            const Icon = typeConfig[activity.type]?.icon || Flame;
            const color = typeConfig[activity.type]?.color || 'primary';
            const isVisible = visibleItems.has(index);

            return (
              <div
                key={activity.id}
                data-compact-index={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                  'hover:bg-muted/50 hover:shadow-sm',
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                )}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <div
                  className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: `hsl(var(--color-${color}) / 0.1)` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: `hsl(var(--color-${color}))` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
