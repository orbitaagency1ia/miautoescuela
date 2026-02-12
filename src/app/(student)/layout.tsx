import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { SchoolThemeProvider } from '@/components/providers/SchoolThemeProvider';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  if (!membership) {
    redirect('/elegir-destino');
  }

  // Get school colors for theming
  const { data: school } = await (supabase
    .from('schools')
    .select('primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const schoolColors = {
    primary: school?.primary_color || '#3b82f6',
    secondary: school?.secondary_color || '#1e40af',
  };

  return (
    <SchoolThemeProvider colors={schoolColors}>
      <div className="flex h-screen">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen p-6 md:p-8" style={{
            background: `linear-gradient(180deg, ${schoolColors.primary}08 0%, ${schoolColors.secondary}03 20%, white 50%)`,
          }}>
            {children}
          </div>
        </main>
      </div>
    </SchoolThemeProvider>
  );
}
