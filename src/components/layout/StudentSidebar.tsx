'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Home, BookOpen, MessageSquare, Trophy, Settings, LogOut, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { simpleLogoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Inicio', href: '/inicio', icon: Home },
  { label: 'Cursos', href: '/cursos', icon: BookOpen },
  { label: 'Foro', href: '/foro', icon: MessageSquare },
  { label: 'Ranking', href: '/ranking', icon: Trophy },
  { label: 'Ajustes', href: '/ajustes', icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const [userPoints, setUserPoints] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Get school membership
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle() as any;

        if (membership?.school_id) {
          // Get school data with colors
          const { data: school } = await supabase
            .from('schools')
            .select('name, logo_url, primary_color, secondary_color')
            .eq('id', membership.school_id)
            .maybeSingle() as any;

          if (school) {
            setSchoolName(school.name);
            setSchoolLogo(school.logo_url);
            setPrimaryColor(school.primary_color || '#3b82f6');
            setSecondaryColor(school.secondary_color || '#1e40af');
          }

          // Get activity points from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('activity_points')
            .eq('user_id', user.id)
            .maybeSingle() as any;

          setUserPoints(profile?.activity_points || 0);
        }
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [supabase]);

  const handleLogout = async () => {
    const formData = new FormData();
    await simpleLogoutAction(formData);
  };

  // Calculate level based on points
  const getLevel = () => {
    if (userPoints < 100) return 'Principiante';
    if (userPoints < 500) return 'Intermedio';
    return 'Avanzado';
  };

  return (
    <div
      className="flex h-full w-64 flex-col border-r border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      style={{
        background: `linear-gradient(180deg, ${primaryColor}05 0%, ${secondaryColor}05 50%, white 100%)`,
      }}
    >
      {/* Logo with School Branding - Premium Style with Dynamic Colors */}
      <div
        className="flex h-20 items-center px-5 border-b border-slate-200/60"
        style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)` }}
      >
        <Link href="/inicio" className="flex items-center gap-3 group flex-1">
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt={schoolName}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/40 shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{ boxShadow: `0 4px 20px ${primaryColor}40` }}
            />
          ) : (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              />
              <div
                className="relative p-3 bg-gradient-to-br rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold leading-none truncate text-white drop-shadow-md">
              {schoolName || 'mIAutoescuela'}
            </span>
          </div>
        </Link>
      </div>

      {/* Points Indicator - Premium Card with School Colors */}
      {isLoading ? (
        <div className="px-4 py-4">
          <div className="rounded-2xl bg-slate-100 p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div
            className="relative overflow-hidden rounded-2xl p-4 border-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              borderColor: `${primaryColor}40`,
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-medium">Tus Puntos</p>
                    <p className="text-2xl font-bold text-white">{userPoints}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-white/90">
                Nivel: {getLevel()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Premium Style with School Colors */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group block"
            >
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'shadow-lg text-white scale-105'
                    : 'text-slate-700 hover:bg-white/60 hover:scale-[1.02]'
                )}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  boxShadow: `0 4px 20px ${primaryColor}30`,
                } : {}}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full shadow-sm animate-pulse bg-white" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section - Premium Style */}
      <div className="border-t border-slate-200/60 p-4 bg-slate-50/50">
        {isLoading ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-24 bg-slate-200 rounded mb-1" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-100">
              <Avatar>
                <AvatarFallback
                  className="text-sm font-semibold shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Estudiante</p>
              </div>
            </div>
            <form action={handleLogout}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-10 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
