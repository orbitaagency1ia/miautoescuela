import { createClient } from '@/lib/supabase/server';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { SchoolThemeProvider } from '@/components/providers/SchoolThemeProvider';
import { redirect } from 'next/navigation';

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
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  if (!membership) {
    redirect('/iniciar-sesion');
  }

  // Get school data with colors
  const { data: school } = await (supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  return (
    <SchoolThemeProvider colors={{ primary: primaryColor, secondary: secondaryColor }}>
      <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
        <aside className="w-60 flex-shrink-0 hidden md:block bg-white" style={{ boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}>
          <StudentSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SchoolThemeProvider>
  );
}
