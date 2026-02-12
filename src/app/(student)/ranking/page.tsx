import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Medal, Award, Sparkles, Flame, Target, Zap, Crown, Star, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Using the same school colors approach but server-side
// Client components can use the useSchoolColors hook

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  if (!membership) {
    redirect('/elegir-destino');
  }

  const schoolId = membership.school_id;

  // Get school branding
  const { data: school } = await (supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', schoolId)
    .maybeSingle() as any) || {};

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get all students with profiles (activity_points is in profiles table)
  const { data: leaderboard } = await (supabase
    .from('school_members')
    .select(`
      user_id,
      profiles (
        user_id,
        full_name,
        activity_points
      )
    `)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .eq('status', 'active') as any);

  // Sort by activity_points in JavaScript (since we can't order by nested field)
  const sortedLeaderboard = (leaderboard || [])
    .map((entry: any) => ({
      ...entry,
      activity_points: entry.profiles?.activity_points || 0,
    }))
    .sort((a: any, b: any) => b.activity_points - a.activity_points)
    .slice(0, 20);

  // Find current user's rank
  const currentUserRank = sortedLeaderboard.findIndex((entry: any) => entry.user_id === user.id) + 1;
  const currentUserEntry = sortedLeaderboard.find((entry: any) => entry.user_id === user.id);
  const currentUserPoints = currentUserEntry?.activity_points || 0;

  const pointRules = [
    {
      points: '+10',
      title: 'Completar clase',
      description: 'Finaliza cualquier clase',
      icon: Zap,
      color: primaryColor,
      bg: `${primaryColor}10`,
      bgHover: `${primaryColor}20`,
    },
    {
      points: '+5',
      title: 'Publicar en foro',
      description: 'Crea una nueva discusión',
      icon: Star,
      color: '#059669',
      bg: '#d1fae5',
      bgHover: '#a7f3d0',
    },
    {
      points: '+2',
      title: 'Comentar',
      description: 'Participa en discusiones',
      icon: Target,
      color: secondaryColor,
      bg: `${secondaryColor}10`,
      bgHover: `${secondaryColor}20`,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Premium Header with Animated Background */}
      <div
        className="relative overflow-hidden rounded-[20px] p-8 md:p-10 border shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        style={{
          background: `linear-gradient(to bottom right, ${primaryColor}08 0%, ${secondaryColor}05 50%, ${primaryColor}03 100%)`,
          borderColor: `${primaryColor}30`
        }}
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${primaryColor}30 0%, ${secondaryColor}20 100%)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 animate-pulse"
            style={{ animationDelay: '1.5s', background: `linear-gradient(135deg, ${secondaryColor}30 0%, ${primaryColor}20 100%)` }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDelay: '0.75s', background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}15 100%)` }}
          />
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-amber-100/30" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Icon with gradient background */}
            <div
              className="p-4 rounded-[20px] shadow-xl hover:shadow-2xl transition-shadow duration-300"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: `0 10px 40px ${primaryColor}40`
              }}
            >
              <Trophy className="h-7 w-7 text-white" />
            </div>

            {/* Badge with blur */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border text-sm font-semibold shadow-sm"
              style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Competitividad</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Ranking de Estudiantes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Compite con tus compañeros y sube de nivel. Los alumnos más activos destacan en la tabla de clasificación.
          </p>
        </div>
      </div>

      {/* Stats Row - Premium Cards */}
      <div className="grid gap-5 grid-cols-3">
        {/* Total Students */}
        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 border animate-fade-in select-none"
          style={{
            animationDelay: '100ms',
            borderColor: `${primaryColor}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${primaryColor}08 0%, ${secondaryColor}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
            }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2 font-medium">Total Estudiantes</p>
              <p className="text-5xl font-bold text-gray-900 tracking-tight">{sortedLeaderboard.length}</p>
            </div>
            <div
              className="p-4 rounded-[16px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)` }}
            >
              <div
                className="p-2 rounded-full"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 border animate-fade-in select-none"
          style={{
            animationDelay: '150ms',
            borderColor: `${secondaryColor}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${secondaryColor}08 0%, ${primaryColor}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${secondaryColor}15 0%, ${primaryColor}15 100%)`
            }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2 font-medium">Puntos Totales</p>
              <p className="text-5xl font-bold text-gray-900 tracking-tight">{sortedLeaderboard.reduce((sum: number, entry: any) => sum + entry.activity_points, 0)}</p>
            </div>
            <div
              className="p-4 rounded-[16px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${primaryColor}15 100%)` }}
            >
              <div
                className="p-2 rounded-full"
                style={{ background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)` }}
              >
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Your Rank - Highlighted Card */}
        <div
          className="group relative overflow-hidden rounded-[20px] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-500 border-2 animate-fade-in select-none"
          style={{
            animationDelay: '200ms',
            background: `linear-gradient(to bottom right, ${primaryColor}10 0%, ${secondaryColor}10 100%)`,
            borderColor: `${primaryColor}40`
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-[20px]">
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm mb-2 font-semibold" style={{ color: primaryColor }}>Tu Posición</p>
              <p className="text-5xl font-bold text-gray-900 tracking-tight">#{currentUserRank > 0 ? currentUserRank : '-'}</p>
              <p className="text-sm text-gray-600 mt-1 font-medium">{currentUserPoints} puntos</p>
            </div>
            <div
              className="p-4 rounded-[16px] bg-white/70 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-md border"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <div
                className="p-2 rounded-full"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard - Premium Card */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden transition-all duration-500">
        {/* Premium Header */}
        <div className="relative overflow-hidden p-8 border-b border-gray-200/60">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50" />

          {/* Animated decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400/20 to-amber-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Icon with gradient */}
              <div className="p-3 rounded-[16px] bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 shadow-xl shadow-amber-500/30">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tabla de Líderes</h2>
                <p className="text-sm text-gray-600 mt-1">Los alumnos más destacados</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-sm text-gray-600 font-semibold">
              Top {sortedLeaderboard.length} alumnos
            </div>
          </div>
        </div>

        <div className="p-8">
          {!sortedLeaderboard || sortedLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-8 rounded-[24px] mb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-xl shadow-amber-200/50">
                <Trophy className="h-20 w-20 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sin datos</h3>
              <p className="text-gray-500 text-lg">
                No hay actividad registrada todavía
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLeaderboard.map((entry: any, index: number) => {
                const rank = index + 1;
                const isCurrentUser = entry.user_id === user.id;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'relative flex items-center gap-5 p-5 rounded-[20px] border-2 transition-all duration-500 animate-fade-in group cursor-pointer select-none overflow-hidden',
                      isCurrentUser
                        ? 'shadow-lg'
                        : 'bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1',
                      isTop3 && !isCurrentUser && 'hover:scale-[1.01]'
                    )}
                    style={{
                      animationDelay: `${200 + index * 50}ms`,
                      background: isCurrentUser
                        ? `linear-gradient(to right, ${primaryColor}10 0%, ${secondaryColor}10 100%)`
                        : undefined,
                      borderColor: isCurrentUser
                        ? `${primaryColor}50`
                        : `${primaryColor}15`
                    }}
                  >
                    {/* Background gradient on hover for non-current users */}
                    {!isCurrentUser && (
                      <>
                        <div
                          className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none"
                          style={{
                            background: `linear-gradient(to bottom right, ${primaryColor}05 0%, ${secondaryColor}05 100%)`,
                            opacity: 0
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-[20px] transition-all duration-500 pointer-events-none group-hover:opacity-100"
                          style={{
                            background: `linear-gradient(to bottom right, ${primaryColor}10 0%, ${secondaryColor}10 100%)`
                          }}
                        />
                      </>
                    )}

                    {/* Rank Badge */}
                    <div className="flex-shrink-0 relative z-10">
                      {isTop3 ? (
                        <div className="relative">
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{
                            background: rank === 1
                              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                              : rank === 2
                                ? 'linear-gradient(135deg, #94A3B8, #6B7280)'
                                : 'linear-gradient(135deg, #D97706, #B45309)',
                          }} />

                          <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{
                            background: rank === 1
                              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                              : rank === 2
                                ? 'linear-gradient(135deg, #94A3B8, #6B7280)'
                                : 'linear-gradient(135deg, #D97706, #B45309)',
                          }}>
                            {rank === 1 && <Crown className="h-6 w-6 text-white absolute -top-1 drop-shadow-lg" />}
                            {rank === 2 && <Medal className="h-6 w-6 text-white drop-shadow-lg" />}
                            {rank === 3 && <Award className="h-6 w-6 text-white drop-shadow-lg" />}
                            <span className="text-lg font-bold text-white drop-shadow-md">{rank}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600 border-2 border-gray-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300 transition-all duration-300 shadow-sm">
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0 z-10">
                      <Avatar className="h-14 w-14 shadow-lg">
                        <AvatarFallback
                          className={cn(
                            'font-semibold text-base',
                            isCurrentUser ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white',
                            isTop3 && !isCurrentUser && 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-2 border-white shadow-lg'
                          )}
                        >
                          {entry.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Star badge for top 3 */}
                      {isTop3 && !isCurrentUser && (
                        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg" style={{
                          background: rank === 1
                            ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                            : rank === 2
                              ? 'linear-gradient(135deg, #94A3B8, #6B7280)'
                              : 'linear-gradient(135deg, #D97706, #B45309)',
                        }}>
                          <Star className="h-4 w-4 text-white fill-white drop-shadow-md" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-900 truncate text-lg">
                          {entry.profiles?.full_name || 'Usuario'}
                        </p>
                        {isCurrentUser && (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                            style={{
                              background: `linear-gradient(to right, ${primaryColor} 0%, ${secondaryColor} 100%)`
                            }}
                          >
                            Tú
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 z-10">
                      {/* Points */}
                      <div className="flex-shrink-0 text-right min-w-[100px]">
                        <p className={cn(
                          'text-4xl font-bold tracking-tight',
                          isTop3 && !isCurrentUser && 'text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600',
                          isCurrentUser && 'text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600'
                        )}>
                          {entry.activity_points}
                        </p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">puntos</p>
                      </div>

                      {/* Trending indicator */}
                      {index > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-amber-50 group-hover:border-amber-200 transition-all duration-300">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-600">+{sortedLeaderboard[index - 1]?.activity_points - entry.activity_points || 0}</span>
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <ChevronRight
                      className="h-6 w-6 text-slate-300 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 z-10"
                      style={{ transitionProperty: 'color, transform' }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* How to earn points - Premium Section */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-gray-200/60 transition-all duration-500 animate-fade-in" style={{ animationDelay: '800ms' }}>
        <div className="flex items-center gap-4 mb-8">
          {/* Icon with gradient */}
          <div className="p-3 rounded-[16px] bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 shadow-xl shadow-orange-500/30">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">¿Cómo ganar puntos?</h3>
            <p className="text-sm text-gray-600 mt-1">Completa acciones y sube en el ranking</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {pointRules.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <div
                key={index}
                className="group relative flex items-start gap-5 p-6 rounded-[20px] border-2 border-gray-200/60 hover:border-gray-300/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 animate-fade-in select-none overflow-hidden"
                style={{ animationDelay: `${850 + index * 100}ms` }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/100 group-hover:to-gray-100/100 transition-all duration-500 pointer-events-none" />

                {/* Icon */}
                <div className="relative z-10">
                  <div className={cn(
                    'p-3 rounded-[16px] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm',
                    rule.bg
                  )}>
                    <div className={cn('p-2 rounded-full bg-white/80 backdrop-blur-sm', rule.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                      <Icon className={cn('h-6 w-6', rule.color)} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative z-10">
                  <p className={cn('text-5xl font-bold tracking-tight mb-2', rule.color)}>
                    {rule.points}
                  </p>
                  <p className="font-bold text-gray-900 text-lg mt-1">{rule.title}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
