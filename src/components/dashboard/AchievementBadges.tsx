'use client';

import { useEffect, useState, useRef } from 'react';
import { Award, Trophy, Star, Target, Zap, Crown, Gem, Flame, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof iconMap;
  requirement: number;
  progress: number;
  unlocked?: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  crown: Crown,
  gem: Gem,
  flame: Flame,
  medal: Medal,
  award: Award,
};

const rarityConfig = {
  common: {
    colors: ['from-gray-400 to-gray-500', 'text-gray-400', 'bg-gray-500/10', 'border-gray-500/30'],
    glow: 'rgba(156, 163, 175, 0.3)',
  },
  rare: {
    colors: ['from-blue-400 to-blue-600', 'text-blue-400', 'bg-blue-500/10', 'border-blue-500/30'],
    glow: 'rgba(96, 165, 250, 0.4)',
  },
  epic: {
    colors: ['from-purple-400 to-purple-600', 'text-purple-400', 'bg-purple-500/10', 'border-purple-500/30'],
    glow: 'rgba(192, 132, 252, 0.5)',
  },
  legendary: {
    colors: ['from-yellow-400 via-orange-400 to-red-500', 'text-transparent bg-clip-text bg-gradient-to-r', 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10', 'border-yellow-500/30'],
    glow: 'rgba(251, 191, 36, 0.6)',
  },
};

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
  showProgress?: boolean;
  delay?: number;
}

export function AchievementBadges({
  achievements,
  maxDisplay = 6,
  showProgress = true,
  delay = 0,
}: AchievementBadgesProps) {
  const [visibleBadges, setVisibleBadges] = useState<Set<number>>(new Set());
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-badge-index') || '0');
            setTimeout(() => {
              setVisibleBadges((prev) => new Set([...prev, index]));
            }, index * 100);
          }
        });
      },
      { threshold: 0.2 }
    );

    const badges = containerRef.current?.querySelectorAll('[data-badge-index]');
    badges?.forEach((badge) => observer.observe(badge));

    return () => observer.disconnect();
  }, []);

  const displayedAchievements = achievements.slice(0, maxDisplay);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Logros</h3>
        <span className="text-sm text-muted-foreground">
          {achievements.filter((a) => a.unlocked).length} / {achievements.length} desbloqueados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayedAchievements.map((achievement, index) => {
          const Icon = iconMap[achievement.icon];
          const rarity = rarityConfig[achievement.rarity];
          const isUnlocked = achievement.unlocked || achievement.progress >= achievement.requirement;
          const isVisible = visibleBadges.has(index);
          const isHovered = hoveredBadge === index;

          return (
            <div
              key={achievement.id}
              data-badge-index={index}
              className={cn(
                'relative group rounded-2xl border-2 p-4 transition-all duration-500 cursor-default',
                'hover:shadow-xl hover:scale-105',
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              )}
              style={{
                borderColor: isUnlocked
                  ? rarity.colors[3].split('/')[0].replace('border-', '') + '/50'
                  : 'hsl(var(--color-border) / 0.3)',
                background: isUnlocked
                  ? rarity.colors[2]
                  : 'hsl(var(--color-muted) / 0.2)',
                transitionDelay: `${delay + index * 75}ms`,
              }}
              onMouseEnter={() => setHoveredBadge(index)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              {/* Glow effect for unlocked badges */}
              {isUnlocked && (
                <div
                  className="absolute inset-0 rounded-2xl blur-xl transition-all duration-500 -z-10"
                  style={{
                    background: rarity.colors[0].replace('from-', 'linear-gradient(135deg, ').replace(' to-', ', '),
                    opacity: isHovered ? 0.6 : 0.2,
                  }}
                />
              )}

              {/* Shimmer effect */}
              {isUnlocked && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </div>
              )}

              {/* Corner accents for legendary */}
              {achievement.rarity === 'legendary' && isUnlocked && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/50 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/50 rounded-br-lg" />
                </>
              )}

              <div className="flex flex-col items-center text-center space-y-3">
                {/* Icon container */}
                <div
                  className={cn(
                    'relative p-3 rounded-xl transition-all duration-300',
                    isHovered && 'scale-110 rotate-6'
                  )}
                  style={{
                    background: isUnlocked
                      ? rarity.colors[0].replace('from-', 'linear-gradient(135deg, ').replace(' to-', ', ')
                      : 'hsl(var(--color-muted) / 0.3)',
                  }}
                >
                  {/* Animated ring for unlocked */}
                  {isUnlocked && (
                    <div
                      className={cn(
                        'absolute inset-0 rounded-xl border-2 animate-ping',
                        rarity.colors[2].replace('bg-', 'border-').replace('/10', '')
                      )}
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Particles on hover */}
                  {isUnlocked && isHovered && (
                    <>
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <div className="absolute -bottom-1 left-1 w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDelay: '0.3s' }} />
                    </>
                  )}

                  <Icon
                    className={cn(
                      'h-6 w-6 relative z-10',
                      isUnlocked ? 'text-white' : 'text-muted-foreground'
                    )}
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <p
                    className={cn(
                      'text-sm font-semibold transition-colors duration-200',
                      isUnlocked ? rarity.colors[1] : 'text-muted-foreground'
                    )}
                  >
                    {achievement.title}
                  </p>
                  {!isUnlocked && showProgress && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%`,
                            background: rarity.colors[0].replace('from-', 'linear-gradient(90deg, ').replace(' to-', ', '),
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress} / {achievement.requirement}
                      </p>
                    </div>
                  )}

                  {/* Unlocked badge */}
                  {isUnlocked && (
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500 font-medium">Desbloqueado</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lock icon for locked badges */}
              {!isUnlocked && (
                <div className="absolute top-2 right-2 p-1 rounded-md bg-muted/80">
                  <div className="w-3 h-3 rounded-sm border-2 border-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1s ease-out;
        }
      `}</style>
    </div>
  );
}

// Mini badge component for widgets
export function MiniBadge({
  achievement,
  delay = 0,
}: {
  achievement: Achievement;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const Icon = iconMap[achievement.icon];
  const rarity = rarityConfig[achievement.rarity];
  const isUnlocked = achievement.unlocked || achievement.progress >= achievement.requirement;

  return (
    <div
      ref={ref}
      className={cn(
        'group relative p-3 rounded-xl border-2 transition-all duration-300 cursor-default',
        'hover:scale-105 hover:shadow-lg'
      )}
      style={{
        borderColor: isUnlocked
          ? rarity.colors[3].split('/')[0].replace('border-', '') + '/50'
          : 'hsl(var(--color-border) / 0.3)',
        background: isUnlocked
          ? rarity.colors[2]
          : 'hsl(var(--color-muted) / 0.2)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg transition-all duration-300',
            isHovered && 'scale-110 rotate-6'
          )}
          style={{
            background: isUnlocked
              ? rarity.colors[0].replace('from-', 'linear-gradient(135deg, ').replace(' to-', ', ')
              : 'hsl(var(--color-muted) / 0.3)',
          }}
        >
          <Icon className={cn('h-4 w-4', isUnlocked ? 'text-white' : 'text-muted-foreground')} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate transition-colors duration-200',
              isUnlocked ? rarity.colors[1] : 'text-muted-foreground'
            )}
          >
            {achievement.title}
          </p>
          {!isUnlocked && (
            <p className="text-xs text-muted-foreground">
              {achievement.progress} / {achievement.requirement}
            </p>
          )}
        </div>

        {/* Status indicator */}
        {isUnlocked ? (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}

// Achievement progress bar component
export function AchievementProgress({
  achievements,
  delay = 0,
}: {
  achievements: Achievement[];
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const unlockedCount = achievements.filter((a) => a.unlocked || a.progress >= a.requirement).length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div
      ref={ref}
      className="p-4 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-md"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className="font-semibold">Progreso de Logros</span>
        </div>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Progress bar */}
        <div
          className="absolute inset-y-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: isVisible ? `${percentage}%` : '0%',
            background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)), hsl(var(--color-accent)))',
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-0.5 bg-background/80"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {unlockedCount} de {totalCount} logros desbloqueados
      </p>
    </div>
  );
}
