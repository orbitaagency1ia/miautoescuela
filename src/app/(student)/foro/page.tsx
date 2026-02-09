import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function ForumPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get school_id
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const schoolId = membership?.school_id;

  // Get posts with author info and comment counts
  const { data: posts } = await (supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      profiles (
        full_name
      ),
      comments (count)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false }) as any);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Foro de Alumnos</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Discusiones</h1>
          <p className="text-gray-500 mt-1">
            Comparte dudas y experiencias con tus compañeros
          </p>
        </div>
        <Link href="/foro/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {!posts || posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="inline-flex p-6 rounded-3xl bg-blue-50 mb-6">
            <MessageSquare className="h-16 w-16 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Sin publicaciones</h3>
          <p className="text-gray-500 mb-6">
            No hay publicaciones todavía. ¡Sé el primero!
          </p>
          <Link href="/foro/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 font-semibold shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Crear Publicación
            </Button>
          </Link>
        </div>
      ) : (
        /* Posts List */
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/foro/${post.id}`}>
              <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">
                        {post.profiles?.full_name || 'Usuario'}
                      </span>
                      <span>•</span>
                      <span>
                        {format(new Date(post.created_at), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {Array.isArray(post.comments) ? post.comments.length : post.comments?.count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
