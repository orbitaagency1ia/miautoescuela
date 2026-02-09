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
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('role', 'owner')
          .maybeSingle() as any;

        if (membership?.school_id) {
          // Get school data for logo and name
          const { data: school } = await supabase
            .from('schools')
            .select('id, name, logo_url')
            .eq('id', membership.school_id)
            .maybeSingle() as any;

          if (school) {
            setSchoolData(school);
          }

          // Get active students count
          const { data: students } = await supabase
            .from('school_members')
            .select('user_id')
            .eq('school_id', membership.school_id)
            .eq('role', 'student');

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
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      {/* Logo with School Branding */}
      <div className="flex h-16 items-center border-b px-4 relative overflow-hidden bg-card/30">
        {/* Gradient accent at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, ${hexPrimary} 0%, ${hexSecondary} 100%)`
          }}
        />

        <Link href="/panel" className="flex items-center gap-3 group flex-1">
          {schoolData?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={schoolData.logo_url}
              alt={displayName}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105"
            />
          ) : (
            <div
              className="p-2 rounded-xl ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${hexPrimary} 0%, ${hexSecondary} 100%)`
              }}
            >
              <Car className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold leading-none truncate group-hover:text-primary transition-colors">
              {displayName}
            </span>
            {schoolData && (
              <span className="text-xs text-muted-foreground truncate">Panel de control</span>
            )}
          </div>
        </Link>

        {/* Quick Settings Button */}
        <Link href="/configuracion?tab=branding">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Active Students Indicator */}
      {!isLoading && activeStudents > 0 && (
        <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: `${hexPrimary}15`,
              border: `1px solid ${hexPrimary}30`
            }}
          >
            <Flame className="h-4 w-4 flex-shrink-0" style={{ color: hexPrimary }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: hexPrimary }}>
                {activeStudents} alumnos activos
              </p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
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
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'shadow-md'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
                style={isActive ? {
                  backgroundColor: `${hexPrimary}20`,
                  color: hexPrimary
                } : {}}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: hexPrimary }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4 bg-card/30">
        {!isLoading && (
          <>
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-default">
              <Avatar className="ring-2 ring-primary/10">
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    backgroundColor: `${hexPrimary}20`,
                    color: hexPrimary
                  }}
                >
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Propietario</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
