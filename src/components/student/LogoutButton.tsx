'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/iniciar-sesion');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full flex items-center justify-start text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all duration-150 opacity-60 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="h-[18px] w-[18px] mr-2" strokeWidth={1.5} />
      {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  );
}
