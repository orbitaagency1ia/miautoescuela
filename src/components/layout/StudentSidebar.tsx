'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Trophy, MessageSquare, Settings, Home, LogOut, Car, Flame } from 'lucide-react';
import { simpleLogoutAction } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const STUDENT_NAV_ITEMS = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/foro', label: 'Foro', icon: MessageSquare },
  { href: '/ajustes', label: 'Configuración', icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [schoolData, setSchoolData] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Get user's school membership
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle() as any;

        if (membership?.school_id) {
          // Get school data
          const { data: school } = await supabase
            .from('schools')
            .select('id, name, logo_url')
            .eq('id', membership.school_id)
            .maybeSingle() as any;

          if (school) {
            setSchoolData(school);
          }
        }

        // Calculate points from completed lessons
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id);

        setUserPoints((progress?.length || 0) * 10);
      }
      setIsLoading(false);
    };

    fetchSchoolData();

    return () => {};
  }, [supabase]);

  async function handleLogout() {
    const formData = new FormData();
    await simpleLogoutAction(formData);
  }

  return (
    <div className="flex flex-col h-full bg-white" style={{ boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}>
      {/* Logo/Branding */}
      <div className="p-6 pb-5">
        <Link href="/inicio" className="flex items-center gap-3">
          {schoolData?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={schoolData.logo_url}
              alt={schoolData.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {schoolData?.name || 'Autoescuela'}
            </p>
            <p className="text-xs text-gray-400 truncate">Área del alumno</p>
          </div>
        </Link>
      </div>

      {/* Badge Puntos/Nivel */}
      {!isLoading && (
        <div className="px-4 mb-6">
          <div className="bg-[#F8F9FB] rounded-[14px] p-[14px_16px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                <Flame className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Tus puntos</p>
                <p className="text-lg font-bold text-[#3B82F6]">{userPoints}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#111827]">
              Nivel: {userPoints < 100 ? 'Principiante' : userPoints < 500 ? 'Intermedio' : 'Avanzado'}
            </p>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-1">
        {STUDENT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  'flex items-center gap-3 px-[14px] py-3 rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-[#EFF6FF] text-[#3B82F6] font-semibold'
                    : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Usuario abajo - Cerrar Sesión */}
      <div className="p-4 pt-5">
        {!isLoading && (
          <>
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {userName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-[#9CA3AF]">Alumno</p>
              </div>
            </div>
            <form action={handleLogout}>
              <button
                type="submit"
                className="w-full flex items-center justify-start text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all duration-150 opacity-60 hover:opacity-100"
              >
                <LogOut className="h-[18px] w-[18px] mr-2" strokeWidth={1.5} />
                Cerrar Sesión
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
