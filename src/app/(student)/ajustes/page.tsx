import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, LogOut, Settings, Sparkles, Flame, Trophy, School, Shield, Camera } from 'lucide-react';
import { simpleLogoutAction } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function StudentSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get profile
  const { data: profile } = await (supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() as any);

  // Get school info
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id, joined_at, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const { data: school } = await (supabase
    .from('schools')
    .select('name')
    .eq('id', membership?.school_id)
    .maybeSingle() as any);

  // Get activity stats
  const { data: lessonsProgress } = await (supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id) as any);

  const completedLessons = lessonsProgress?.length || 0;
  const totalPoints = profile?.activity_points || 0;

  async function updateProfile(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;

    if (!fullName || fullName.trim().length === 0) {
      throw new Error('El nombre es obligatorio');
    }

    // Update profile
    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Error al actualizar el perfil');
    }

    revalidatePath('/ajustes');
    revalidatePath('/inicio');
    revalidatePath('/ranking');
    revalidatePath('/cursos');
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
    || user.email?.slice(0, 2).toUpperCase()
    || 'U';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-blue-700 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Configuración
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Ajustes
          </h1>
          <p className="text-base text-slate-600 max-w-2xl">
            Gestiona tu perfil y preferencias de cuenta
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {profile?.full_name || 'Usuario'}
            </h2>
            <p className="text-slate-500 text-sm mb-3">{user.email}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">
                <Flame className="h-4 w-4" />
                <span>{totalPoints} puntos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                <Trophy className="h-4 w-4" />
                <span>{completedLessons} lecciones</span>
              </div>
              {school && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                  <School className="h-4 w-4" />
                  <span>{school.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Editar Perfil</h3>
            <p className="text-sm text-slate-500">Actualiza tu información personal</p>
          </div>
        </div>

        <form action={updateProfile} className="space-y-5">
          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="pl-11 bg-slate-50 rounded-xl border-slate-200 text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              El correo no se puede cambiar
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
              Nombre Completo *
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="Juan Pérez García"
                className="pl-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
              Teléfono (opcional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ''}
                placeholder="+34 600 000 000"
                className="pl-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <Shield className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Información de Cuenta</h3>
            <p className="text-sm text-slate-500">Detalles de tu membresía</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Rol</p>
              <p className="font-semibold text-slate-900 capitalize">
                {membership?.role === 'student' ? 'Estudiante' : membership?.role}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Miembro desde</p>
              <p className="font-semibold text-slate-900">
                {membership?.joined_at
                  ? format(new Date(membership.joined_at), 'dd MMM yyyy', { locale: es })
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-slate-500">Estado</p>
              <p className="font-semibold text-emerald-600">Activo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cerrar Sesión</h3>
            <p className="text-sm text-slate-500">Salir de tu cuenta</p>
          </div>
        </div>

        <form action={simpleLogoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
