import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Check if user is super admin (email domain check or metadata)
  const userEmail = user.email;
  const isSuperAdmin = userEmail?.endsWith('@miautoescuela.com') ||
                       userEmail?.endsWith('@admin.com') ||
                       user.user_metadata?.role === 'admin';

  // Check if user has admin/owner role in any school
  const { data: memberRole } = await (supabase
    .from('school_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .in('role', ['admin', 'owner'])
    .maybeSingle() as any);

  if (!isSuperAdmin && !memberRole) {
    redirect('/inicio');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
