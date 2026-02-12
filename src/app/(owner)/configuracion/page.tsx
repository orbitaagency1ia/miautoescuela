'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ConfiguracionForm } from '@/components/owner/ConfiguracionForm';
import { Sparkles, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Unwrap searchParams Promise for Next.js 16
  const resolvedParams = use(searchParams);
  const defaultTab = resolvedParams.tab || 'general';

  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    async function loadSchool() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        redirect('/iniciar-sesion');
        return;
      }

      // Get user's school membership first - consistent with other pages
      const { data: membership } = await supabase
        .from('school_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle() as any;

      if (!membership) {
        setLoading(false);
        return;
      }

      // Get school details separately for branding
      const { data: schoolBranding } = await supabase
        .from('schools')
        .select('id, name, primary_color, secondary_color')
        .eq('id', membership.school_id)
        .maybeSingle() as any;

      if (schoolBranding) {
        setSchoolData(schoolBranding);
      }

      // Get full school data - use maybeSingle to avoid errors
      const { data: schoolFullData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', membership.school_id)
        .maybeSingle() as any;

      setSchool(schoolFullData);
      setLoading(false);
    }

    loadSchool();
  }, [supabase]);

  const handleSchoolUpdate = (updatedSchool: any) => {
    setSchool(updatedSchool);
    setSchoolData(updatedSchool);
    // Trigger a custom event for sidebar update
    window.dispatchEvent(new CustomEvent('school-updated', { detail: updatedSchool }));
  };

  const primaryColor = schoolData?.primary_color || '#3B82F6';
  const secondaryColor = schoolData?.secondary_color || '#1E40AF';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl animate-spin"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          />
          <p className="text-slate-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8">
        <div
          className="p-6 rounded-3xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
          }}
        >
          <Settings className="h-16 w-16" style={{ color: primaryColor }} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">No se encontró información de la autoescuela</h3>
          <p className="text-slate-600">Configura tu autoescuela para comenzar</p>
        </div>
        <a
          href="/setup"
          className="px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          Crear mi autoescuela
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 md:p-10 border border-blue-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Personalización</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Configuración
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Personaliza tu autoescuela con tu identidad única. Ajusta el branding, colores y configuración de tu cuenta.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <ConfiguracionForm school={school} onUpdate={handleSchoolUpdate} />
    </div>
  );
}
