'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, BookOpen, Users, MessageSquare, Trophy, Settings, CreditCard, LogOut, Palette, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { simpleLogoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState, useMemo } from 'react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Panel', href: '/panel', icon: LayoutDashboard },
  { label: 'Temas y Clases', href: '/temas', icon: BookOpen },
  { label: 'Invitar Alumno', href: '/alumnos/invitar', icon: Users },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
  { label: 'Suscripción', href: '/suscripcion', icon: CreditCard },
];

export function OwnerSidebar({ schoolName: propSchoolName }: { schoolName?: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>('');
  const [schoolData, setSchoolData] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get colors from CSS variables (set by SchoolThemeProvider)
  const primaryColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue('--color-primary')?.trim() || '#3B82F6';
    }
    return '#3B82F6';
  }, []);

  const hexPrimary = useMemo(() => {
    // Convert HSL to Hex for inline styles
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue('--school-primary')?.trim() || '#3B82F6';
    }
    return '#3B82F6';
  }, []);

  const hexSecondary = useMemo(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue('--school-secondary')?.trim() || '#1E40AF';
    }
    return '#1E40AF';
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Get user's school membership
        const { data: membership } = await (supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('role', 'owner')
          .maybeSingle()) as any;

        if (membership?.school_id) {
          // Get school data for logo and name
          const { data: school } = await (supabase
            .from('schools')
            .select('id, name, logo_url')
            .eq('id', membership.school_id)
            .maybeSingle()) as any;

          if (school) {
            setSchoolData(school);
          }

          // Get active students count
          const { data: students } = await (supabase
            .from('school_members')
            .select('user_id')
            .eq('school_id', membership.school_id)
            .eq('role', 'student')) as any;

          setActiveStudents(students?.length || 0);
        }
      }
      setIsLoading(false);
    };

    fetchUserData();

    // Listen for school updates
    const handleSchoolUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        setSchoolData(customEvent.detail);
        // Trigger page refresh to update theme colors
        window.location.reload();
      }
    };

    window.addEventListener('school-updated', handleSchoolUpdate);

    return () => {
      window.removeEventListener('school-updated', handleSchoolUpdate);
    };
  }, [supabase]);

  const handleLogout = async () => {
    const formData = new FormData();
    await simpleLogoutAction(formData);
  };

  const displayName = schoolData?.name || propSchoolName || 'mIAutoescuela';

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Logo with School Branding - Premium Style */}
      <div className="flex h-16 items-center px-5 border-b border-gray-200/60">
        <Link href="/panel" className="flex items-center gap-3 group flex-1">
          {schoolData?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={schoolData.logo_url}
              alt={displayName}
              className="h-10 w-10 rounded-2xl object-cover ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105"
            />
          ) : (
            <div
              className="p-2.5 rounded-2xl transition-all duration-300 group-hover:scale-105 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${hexPrimary} 0%, ${hexSecondary} 100%)`
              }}
            >
              <Car className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold leading-none truncate text-gray-900">
              {displayName}
            </span>
            {schoolData && (
              <span className="text-xs text-gray-500 truncate">Panel de control</span>
            )}
          </div>
        </Link>

        {/* Quick Settings Button */}
        <Link href="/configuracion?tab=branding">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Active Students Indicator - Premium Card */}
      {!isLoading && activeStudents > 0 && (
        <div className="px-4 py-4 border-b border-gray-200/60">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            style={{
              background: `linear-gradient(135deg, ${hexPrimary}10 0%, ${hexSecondary}10 100%)`,
              border: `1px solid ${hexPrimary}20`
            }}
          >
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${hexPrimary}20` }}>
              <Flame className="h-4 w-4 flex-shrink-0" style={{ color: hexPrimary }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-gray-900">
                {activeStudents}
              </p>
              <p className="text-xs text-gray-500">Alumnos activos esta semana</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Premium Style */}
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
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${hexPrimary}15 0%, ${hexSecondary}15 100%)`,
                  color: hexPrimary
                } : {}}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full shadow-sm animate-pulse"
                    style={{ backgroundColor: hexPrimary }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section - Premium Style */}
      <div className="border-t border-gray-200/60 p-4 bg-gray-50/50">
        {!isLoading && (
          <>
            <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <Avatar className="ring-2 ring-primary/10">
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${hexPrimary}20 0%, ${hexSecondary}20 100%)`,
                    color: hexPrimary
                  }}
                >
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Propietario</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-10 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
