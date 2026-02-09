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
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo with Admin Branding */}
      <div className="flex h-16 items-center border-b px-4 relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary" />

        <Link href="/admin" className="flex items-center gap-3 group flex-1">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative p-2 gradient-primary rounded-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none">mIAutoescuela</span>
            <span className="text-xs text-muted-foreground">Administración</span>
          </div>
        </Link>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-600">{systemStatus}</span>
        </div>
      </div>

      {/* System Stats Card */}
      {!isLoading && (
        <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Estado del Sistema</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API</span>
                <span className="text-green-500 font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DB</span>
                <span className="text-green-500 font-medium">OK</span>
              </div>
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
              className="group"
            >
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                style={isActive ? {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3B82F6'
                } : {}}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        {!isLoading && (
          <>
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar>
                <AvatarFallback className="text-sm font-semibold ring-2 ring-primary/20 bg-gradient-to-br from-primary/20 to-primary/40">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
