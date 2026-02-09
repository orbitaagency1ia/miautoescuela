/**
 * Next.js Middleware
 * Middleware simplificado para evitar bucles de redirección
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/',
  '/iniciar-sesion',
  '/registro',
];

// Rutas que no deben procesar el middleware (evitar bucles)
const bypassRoutes = [
  '/api/',
  '/_next/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass para rutas especiales
  for (const route of bypassRoutes) {
    if (pathname.startsWith(route)) {
      return NextResponse.next();
    }
  }

  // Bypass para archivos estáticos
  if (
    pathname.includes('.') ||  // Imágenes, favicon, etc.
    pathname.includes('/_next')  // Archivos Next.js
  ) {
    return NextResponse.next();
  }

  // Verificar si es una ruta de invitación (comienza con /invitacion/)
  const isInviteRoute = pathname.startsWith('/invitacion/');

  // Verificar si es una ruta pública exacta
  const isPublicRoute = publicRoutes.includes(pathname);

  // Obtener usuario y sesión
  const { supabase, supabaseResponse, user } = await updateSession(request);

  // Si NO hay usuario:
  if (!user) {
    // Permitir rutas públicas y de invitación
    if (isPublicRoute || isInviteRoute) {
      return supabaseResponse;
    }
    // Redirigir a login
    return NextResponse.redirect(new URL('/iniciar-sesion', request.url));
  }

  // Si HAY usuario autenticado:

  // Si está en login/registro, redirigir a elegir-destino
  if (pathname === '/iniciar-sesion' || pathname === '/registro') {
    return NextResponse.redirect(new URL('/elegir-destino', request.url));
  }

  // Para todo lo demás, dejar pasar y añadir headers
  const response = supabaseResponse;
  response.headers.set('x-user-id', user.id);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
