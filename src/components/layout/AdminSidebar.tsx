'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, Building2, CreditCard, Settings, LogOut, Shield, Activity } from 'lucide-react';
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
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Panel', href: '/admin', icon: LayoutDashboard },
  { label: 'Autoescuelas', href: '/admin/autoescuelas', icon: Building2 },
  { label: 'Suscripciones', href: '/admin/suscripciones', icon: CreditCard },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [supabase]);

  const handleLogout = async () => {
    const formData = new FormData();
    await simpleLogoutAction(formData);
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Logo with Admin Branding - Premium Style */}
      <div className="flex h-16 items-center px-5 border-b border-gray-200/60">
        <Link href="/admin" className="flex items-center gap-3 group flex-1">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}
            />
            <div
              className="relative p-2.5 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none text-gray-900">mIAutoescuela</span>
            <span className="text-xs text-gray-500">Administración</span>
          </div>
        </Link>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 border border-green-200">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-600">{systemStatus}</span>
        </div>
      </div>

      {/* System Stats Card - Premium Style */}
      {!isLoading && (
        <div className="px-4 py-4 border-b border-gray-200/60">
          <div
            className="p-4 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-semibold text-gray-700">Estado del Sistema</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-500">API</span>
                <span className="text-green-600 font-bold">99.9%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">DB</span>
                <span className="text-green-600 font-bold">OK</span>
              </div>
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
              className="group"
            >
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(71, 85, 105, 0.15) 100%)',
                  color: '#475569'
                } : {}}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full shadow-sm animate-pulse bg-slate-500" />
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
              <Avatar>
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    color: '#475569'
                  }}
                >
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Administrador</p>
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
