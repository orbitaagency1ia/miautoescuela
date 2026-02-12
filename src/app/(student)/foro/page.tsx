'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Plus, Search, Pin, Lock, Clock, ArrowRight, Sparkles, Users, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSchoolColors } from '@/hooks/use-school-colors';

interface Post {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  author_id: string;
  author: {
    full_name: string | null;
    email: string;
  } | null;
  comments_count: number;
}

export default function ForumPage() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, totalUsers: 0 });
  const schoolColors = useSchoolColors();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/iniciar-sesion');
        return;
      }

      // Get school membership
      const { data: membership, error: membershipError } = await (supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle() as any);

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        setError('Error al cargar membresía');
        return;
      }

      if (!membership) {
        router.push('/elegir-destino');
        return;
      }

      // Get posts
      const { data: postsData, error: postsError } = await (supabase
        .from('posts')
        .select('id, title, body, is_pinned, is_locked, created_at, author_id')
        .eq('school_id', membership.school_id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false }) as any);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setError('Error al cargar publicaciones');
        return;
      }

      // Get comment counts for each post
      const postIds = postsData?.map((p: any) => p.id) || [];
      const { data: commentsData, error: commentsError } = await (supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds) as any);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      // Count comments per post
      const commentCounts: Record<string, number> = {};
      for (const comment of commentsData || []) {
        commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
      }

      // Get author profiles
      const authorIds = postsData?.map((p: any) => p.author_id) || [];
      const authorsMap = new Map<string, any>();

      if (authorIds.length > 0) {
        const { data: authorsData, error: authorsError } = await (supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', authorIds) as any);

        if (!authorsError && authorsData) {
          for (const author of authorsData) {
            authorsMap.set(author.user_id, author);
          }
        }
      }

      // Combine all data
      const postsWithDetails: Post[] = (postsData || []).map((post: any) => ({
        ...post,
        author: authorsMap.get(post.author_id) || null,
        comments_count: commentCounts[post.id] || 0,
      }));

      setPosts(postsWithDetails);

      // Calculate stats
      setStats({
        totalPosts: postsData?.length || 0,
        totalComments: Object.values(commentCounts).reduce((sum: number, count: number) => sum + count, 0),
        totalUsers: new Set(authorIds).size,
      });
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Error inesperado al cargar el foro');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate pinned and regular posts
  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="space-y-6">
      {/* === HEADER PREMIUM === */}
      <div
        className="relative overflow-hidden rounded-[20px] p-8 md:p-10 border shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
        style={{
          background: `linear-gradient(to bottom right, ${schoolColors.primary}08 0%, ${schoolColors.secondary}05 50%, white 100%)`,
          borderColor: `${schoolColors.primary}30`
        }}
      >
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${schoolColors.primary}40 0%, ${schoolColors.secondary}30 100%)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"
            style={{ animationDelay: '1s', background: `linear-gradient(135deg, ${schoolColors.secondary}40 0%, ${schoolColors.primary}30 100%)` }}
          />
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="p-4 rounded-2xl shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${schoolColors.primary} 0%, ${schoolColors.secondary} 100%)`,
                  boxShadow: `0 10px 40px ${schoolColors.primary}40`
                }}
              >
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border text-sm font-semibold mb-2.5"
                  style={{ borderColor: `${schoolColors.primary}30`, color: schoolColors.primary }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Comunidad</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Foro</h1>
                <p className="text-base text-slate-600 mt-1.5">
                  Comparte, aprende y conecta con tus compañeros
                </p>
              </div>
            </div>
            <Link href="/foro/nuevo">
              <Button
                className="text-white rounded-full px-7 py-3 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${schoolColors.primary} 0%, ${schoolColors.secondary} 100%)`
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Pregunta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* === STATS CARDS === */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 animate-fade-in select-none"
          style={{
            animationDelay: '100ms',
            borderColor: `${schoolColors.primary}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.primary}08 0%, ${schoolColors.secondary}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.primary}15 0%, ${schoolColors.secondary}15 100%)`
            }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-slate-700 mb-2">Discusiones</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{stats.totalPosts}</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${schoolColors.primary} 0%, ${schoolColors.secondary} 100%)` }}
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 animate-fade-in select-none"
          style={{
            animationDelay: '150ms',
            borderColor: `${schoolColors.primary}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.secondary}08 0%, ${schoolColors.primary}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.secondary}15 0%, ${schoolColors.primary}15 100%)`
            }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-slate-700 mb-2">Respuestas</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{stats.totalComments}</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${schoolColors.secondary} 0%, ${schoolColors.primary} 100%)` }}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-2 animate-fade-in select-none"
          style={{
            animationDelay: '200ms',
            borderColor: `${schoolColors.primary}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.primary}08 0%, ${schoolColors.secondary}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${schoolColors.primary}15 0%, ${schoolColors.secondary}15 100%)`
            }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-slate-700 mb-2">Participantes</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{stats.totalUsers}</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${schoolColors.secondary} 0%, ${schoolColors.primary} 100%)` }}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* === SEARCH BAR === */}
      <div className="relative group">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors"
          style={{ transitionProperty: 'color' }}
          onFocus={(e) => e.currentTarget.style.color = schoolColors.primary}
        />
        <Input
          type="text"
          placeholder="Buscar en el foro..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 rounded-[20px] border-2 h-14 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 text-base"
          style={{
            borderColor: `${schoolColors.primary}30`
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = schoolColors.primary}
        />
      </div>

      {/* === ERROR MESSAGE === */}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-[20px] p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={loadPosts}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* === POSTS LIST === */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 mb-5 shadow-xl shadow-purple-500/20">
              <MessageSquare className="h-10 w-10 text-purple-600 animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium">Cargando discusiones...</p>
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-slate-200">
          <div className="inline-flex p-8 rounded-[32px] bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 mb-8 shadow-xl shadow-purple-500/10">
            <MessageSquare className="h-20 w-20 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {searchQuery ? 'Sin resultados' : 'Aún no hay publicaciones'}
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {searchQuery
              ? 'No se encontraron publicaciones que coincidan con tu búsqueda.'
              : 'Sé el primero en iniciar una conversación!'}
          </p>
          {!searchQuery && (
            <Link href="/foro/nuevo">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-3.5 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                Crear primera publicación
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned posts */}
          {pinnedPosts.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 px-2">
                <Pin className="h-4 w-4 text-amber-500" />
                FIJADOS
              </div>
              {pinnedPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/foro/${post.id}`}
                  className="block group"
                >
                  <div
                    className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.25)] hover:-translate-y-1 border-2 border-amber-200 transition-all duration-300 animate-fade-in select-none cursor-pointer"
                    style={{ animationDelay: `${250 + index * 50}ms` }}
                  >
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-amber-100/0 to-orange-100/0 group-hover:from-amber-100/30 group-hover:to-orange-100/30 transition-all duration-300 pointer-events-none" />
                    <div className="flex gap-5 items-center relative">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {post.author?.full_name?.slice(0, 2).toUpperCase() || post.author?.email?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-bold shadow-sm">
                              <Pin className="h-3.5 w-3.5" />
                              Fijado
                            </div>
                            {post.is_locked && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                <Lock className="h-3.5 w-3.5" />
                                Cerrado
                              </div>
                            )}
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                              {post.title}
                            </h3>
                          </div>
                          <ChevronRight className="h-5 w-5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                        </div>

                        {/* Author & Time */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2.5">
                          <span className="font-semibold text-slate-700">
                            {post.author?.full_name || 'Usuario'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>

                        {/* Preview */}
                        <p className="text-slate-600 line-clamp-1 text-sm mb-3">
                          {post.body}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-bold text-sm shadow-sm">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.comments_count} {post.comments_count === 1 ? 'respuesta' : 'respuestas'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}

          {/* Regular posts */}
          {regularPosts.length > 0 && pinnedPosts.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 px-2 pt-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              DISCUSIONES
            </div>
          )}

          {regularPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/foro/${post.id}`}
              className="block group"
            >
              <div
                className="relative overflow-hidden bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(168,85,247,0.2)] hover:-translate-y-1 border-2 border-slate-200 hover:border-purple-300 transition-all duration-300 animate-fade-in select-none cursor-pointer"
                style={{ animationDelay: `${300 + (pinnedPosts.length + index) * 50}ms` }}
              >
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple-50/0 to-pink-50/0 group-hover:from-purple-50/30 group-hover:to-pink-50/30 transition-all duration-300 pointer-events-none" />

                <div className="flex gap-5 items-center relative">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {post.author?.full_name?.slice(0, 2).toUpperCase() || post.author?.email?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.is_locked && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                            <Lock className="h-3.5 w-3.5" />
                            Cerrado
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                    </div>

                    {/* Author & Time */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-2.5">
                      <span className="font-semibold text-slate-700">
                        {post.author?.full_name || 'Usuario'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>

                    {/* Preview */}
                    <p className="text-slate-600 line-clamp-1 text-sm mb-3">
                      {post.body}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-bold text-sm shadow-sm">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.comments_count} {post.comments_count === 1 ? 'respuesta' : 'respuestas'}
                      </div>
                    </div>
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
