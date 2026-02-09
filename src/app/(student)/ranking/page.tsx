import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Medal, Award, Sparkles, Flame, Target, Zap, Crown, Star, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get school_id and school branding
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const schoolId = membership?.school_id;

  // Get school branding
  const { data: school } = schoolId ? await (supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', schoolId)
    .maybeSingle() as any) : null;

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get top students by activity points
  const { data: leaderboard } = await (supabase
    .from('school_members')
    .select(`
      activity_points,
      profiles (
        user_id,
        full_name
      )
    `)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('activity_points', { ascending: false })
    .limit(20) as any);

  // Get current user's rank
  const { data: allMembers } = await (supabase
    .from('school_members')
    .select('user_id, activity_points')
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('activity_points', { ascending: false }) as any);

  const currentUserRank = allMembers?.findIndex((m: any) => m.user_id === user.id) + 1;
  const currentUserPoints = allMembers?.find((m: any) => m.user_id === user.id)?.activity_points || 0;

  const pointRules = [
    {
      points: '+10',
      title: 'Completar clase',
      description: 'Finaliza cualquier clase',
      icon: Zap,
      color: 'blue',
    },
    {
      points: '+5',
      title: 'Publicar en foro',
      description: 'Crea una nueva discusión',
      icon: Star,
      color: 'emerald',
    },
    {
      points: '+2',
      title: 'Comentar',
      description: 'Participa en discusiones',
      icon: Target,
      color: 'violet',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border-2"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}10 50%, ${primaryColor}05 100%)`,
          borderColor: `${primaryColor}30`,
        }}
      >
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`,
              animationDuration: '8s',
            }}
          />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, ${secondaryColor}20 0%, transparent 70%)`,
              animationDelay: '2s',
              animationDuration: '10s',
            }}
          />
          {/* Trophy glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl animate-float"
            style={{
              background: `radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${primaryColor}20 1px, transparent 1px),
              linear-gradient(to bottom, ${primaryColor}20 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border-2"
              style={{
                background: `${primaryColor}20`,
                borderColor: `${primaryColor}40`,
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="text-sm font-bold" style={{ color: primaryColor }}>Competitividad</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight flex items-center gap-4">
              <span>Ranking</span>
              <div className="p-3 rounded-2xl animate-bounce-slow"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  animation: 'bounce-slow 2s ease-in-out infinite',
                }}
              >
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Compite con tus compañeros y sube de nivel. Los alumnos más activos destacan en la tabla de clasificación.
            </p>
          </div>
        </div>
      </div>

      {/* Current User Stats Card - Premium */}
      <div className="relative overflow-hidden rounded-3xl border-2 p-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
          borderColor: `${primaryColor}30`,
        }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl animate-float"
            style={{
              background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-2xl border-4 border-dashed animate-spin"
                style={{
                  borderColor: `${primaryColor}40`,
                  animationDuration: '10s',
                }}
              />
              <div
                className="relative p-5 rounded-2xl shadow-premium-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Tu Posición Actual</p>
              <div className="flex items-baseline gap-4">
                <p className="text-6xl font-bold tabular-nums" style={{ color: primaryColor }}>
                  #{currentUserRank}
                </p>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border-2"
                  style={{
                    background: `${primaryColor}10`,
                    borderColor: `${primaryColor}30`,
                  }}
                >
                  <Flame className="h-6 w-6 text-orange-500" />
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {currentUserPoints} puntos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to next rank */}
          {currentUserRank > 1 && (
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Próximo puesto</span>
                <span className="font-bold" style={{ color: primaryColor }}>
                  #{currentUserRank - 1}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 animate-pulse"
                  style={{
                    width: `${Math.max(10, 100 - (currentUserRank * 5))}%`,
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard - Premium */}
      <div className="relative overflow-hidden rounded-3xl border-2 shadow-premium"
        style={{
          background: `linear-gradient(135deg, hsl(var(--color-card) / 1) 0%, hsl(var(--color-muted) / 0.3) 100%)`,
          borderColor: 'hsl(var(--color-border) / 0.5)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl animate-pulse-slow"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              }}
            >
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tabla de Líderes</h2>
              <p className="text-sm text-muted-foreground">Los alumnos más destacados</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!leaderboard || leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="p-6 rounded-3xl mb-6 shadow-premium-lg animate-float"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Trophy className="h-16 w-16" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sin datos</h3>
              <p className="text-muted-foreground">
                No hay actividad registrada todavía
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry: any, index: number) => {
                const rank = index + 1;
                const isCurrentUser = entry.profiles?.user_id === user.id;

                return (
                  <div
                    key={entry.profiles?.user_id}
                    className={cn(
                      'group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-500',
                      'hover:scale-[1.01] hover:shadow-premium',
                      isCurrentUser
                        ? `border-[${primaryColor}] shadow-lg`
                        : 'border-border/50 hover:border-primary/30'
                    )}
                    style={isCurrentUser ? {
                      borderColor: `${primaryColor}80`,
                      background: `${primaryColor}08`,
                    } : {
                      background: rank <= 3
                        ? rank === 1
                          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 165, 0, 0.05) 100%)'
                          : rank === 2
                            ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.05) 0%, rgba(107, 114, 128, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(180, 83, 9, 0.05) 100%)'
                        : 'transparent',
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </div>

                    {/* Rank Badge */}
                    <div className="relative flex-shrink-0">
                      {rank <= 3 ? (
                        <>
                          {/* Glow */}
                          <div className="absolute inset-0 rounded-full blur-lg animate-pulse"
                            style={{
                              background: rank === 1
                                ? 'rgba(255, 215, 0, 0.4)'
                                : rank === 2
                                  ? 'rgba(148, 163, 184, 0.4)'
                                  : 'rgba(217, 119, 6, 0.4)',
                            }}
                          />
                          <div className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
                            style={{
                              background: rank === 1
                                ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                : rank === 2
                                  ? 'linear-gradient(135deg, #94A3B8, #6B7280)'
                                  : 'linear-gradient(135deg, #D97706, #B45309)',
                            }}
                          >
                            {rank === 1 && <Crown className="h-6 w-6 text-white" />}
                            {rank === 2 && <Medal className="h-6 w-6 text-white" />}
                            {rank === 3 && <Award className="h-6 w-6 text-white" />}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold text-sm border-2 border-border">
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-14 w-14 ring-2 ring-background">
                        <AvatarFallback
                          className="font-semibold text-base transition-all duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: isCurrentUser ? `${primaryColor}20` : undefined,
                            color: isCurrentUser ? primaryColor : undefined,
                            background: isCurrentUser
                              ? `${primaryColor}20`
                              : `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`,
                          }}
                        >
                          {entry.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Rank icon for top 3 */}
                      {rank <= 3 && (
                        <div className="absolute -top-1 -right-1 p-1 rounded-full animate-bounce"
                          style={{
                            background: rank === 1
                              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                              : rank === 2
                                ? 'linear-gradient(135deg, #94A3B8, #6B7280)'
                                : 'linear-gradient(135deg, #D97706, #B45309)',
                          }}
                        >
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-base truncate transition-colors duration-300 group-hover:text-primary">
                          {entry.profiles?.full_name || 'Usuario'}
                        </p>
                        {isCurrentUser && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                            style={{
                              background: `${primaryColor}20`,
                              color: primaryColor,
                              border: `1px solid ${primaryColor}40`,
                            }}
                          >
                            Tú
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-3xl font-bold tabular-nums transition-all duration-300 group-hover:scale-110"
                        style={{
                          color: rank <= 3
                            ? rank === 1
                              ? '#FFD700'
                              : rank === 2
                                ? '#94A3B8'
                                : '#D97706'
                            : primaryColor,
                        }}
                      >
                        {entry.activity_points || 0}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">puntos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* How to earn points - Premium */}
      <div className="relative overflow-hidden rounded-3xl border-2 p-6"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}05 0%, ${secondaryColor}05 100%)`,
          borderColor: `${primaryColor}20`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl animate-pulse-slow"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            }}
          >
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">¿Cómo ganar puntos?</h3>
            <p className="text-sm text-muted-foreground">Completa acciones y sube en el ranking</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {pointRules.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default"
                style={{
                  borderColor: `${primaryColor}20`,
                  background: `hsl(var(--color-card) / 0.8)`,
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, hsl(var(--color-${rule.color}) / 0.1), transparent 70%)`,
                  }}
                />

                {/* Shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--color-${rule.color})), hsl(var(--color-${rule.color}) / 0.7))`,
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold tabular-nums"
                      style={{ color: `hsl(var(--color-${rule.color}))` }}
                    >
                      {rule.points}
                    </p>
                    <p className="font-semibold text-sm mt-1">{rule.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
