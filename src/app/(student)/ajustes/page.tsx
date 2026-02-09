import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, LogOut, Settings, Sparkles } from 'lucide-react';
import { simpleLogoutAction } from '@/actions/auth';
import { revalidatePath } from 'next/cache';

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

    // Update profile
    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Error al actualizar el perfil');
    }

    revalidatePath('/ajustes');
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-3">
          <Sparkles className="h-4 w-4" />
          <span>Configuración</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Ajustes</h1>
        <p className="text-gray-500 mt-1">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
            <p className="text-sm text-gray-500">Información personal de tu cuenta</p>
          </div>
        </div>

        <form action={updateProfile} className="space-y-5">
          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="pl-11 bg-gray-50 rounded-xl border-gray-200 text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-400">
              El correo no se puede cambiar
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
              Nombre Completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="Juan Pérez García"
                className="pl-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ''}
                placeholder="+34 600 000 000"
                className="pl-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      {/* Account Card */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Settings className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cuenta</h2>
            <p className="text-sm text-gray-500">Acciones de cuenta</p>
          </div>
        </div>

        <form action={simpleLogoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
