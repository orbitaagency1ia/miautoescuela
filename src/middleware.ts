/**
 * Next.js Middleware - Manejo de sesiones de Supabase
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Actualizar sesión de Supabase
  const { supabaseResponse } = await updateSession(request);

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
