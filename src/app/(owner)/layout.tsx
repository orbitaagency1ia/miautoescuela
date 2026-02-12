import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar';
import { SchoolThemeProvider } from '@/components/providers/SchoolThemeProvider';

export default async function OwnerLayout({
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
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as any);

  if (!membership) {
    redirect('/setup');
  }

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    redirect('/inicio');
  }

  // Get school data with colors
  const { data: school } = await (supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const schoolName = school?.name || 'mIAutoescuela';
  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  return (
    <SchoolThemeProvider colors={{ primary: primaryColor, secondary: secondaryColor }}>
      <div className="flex h-screen" style={{ background: `linear-gradient(180deg, ${primaryColor}03 0%, white 30%)` }}>
        <OwnerSidebar schoolName={schoolName} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SchoolThemeProvider>
  );
}
