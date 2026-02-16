'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Clock, Award, BarChart3, Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsMetrics {
  totalStudents: number;
  activeStudents: number;
  activeLast7Days: number;
  totalLessons: number;
  totalCompletions: number;
  avgCompletionPercent: number;
  newRegistrations: number;
  mostViewed: Array<{
    id: string;
    title: string;
    views: number;
    completions: number;
    completionRate: number;
  }>;
  leastCompleted: Array<{
    id: string;
    title: string;
    views: number;
    completions: number;
    completionRate: number;
  }>;
}

interface AnalyticsClientProps {
  primaryColor: string;
  secondaryColor: string;
  schoolName: string;
}

export function AnalyticsClient({ primaryColor, secondaryColor, schoolName }: AnalyticsClientProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (response.ok) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Analytics
          </h1>
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Analytics de {schoolName}
          </h1>
          <p className="text-slate-600">
            Métricas detalladas del rendimiento de tu plataforma
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Alumnos"
          value={metrics?.totalStudents || 0}
          subtitle="Registrados"
          icon={Users}
          color="blue"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
        <MetricCard
          title="Activos (7 días)"
          value={metrics?.activeLast7Days || 0}
          subtitle="Actividad reciente"
          icon={TrendingUp}
          color="emerald"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
        <MetricCard
          title="Total Completaciones"
          value={metrics?.totalCompletions || 0}
          subtitle="Lecciones terminadas"
          icon={BookOpen}
          color="violet"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
        <MetricCard
          title="Promedio Progreso"
          value={`${metrics?.avgCompletionPercent || 0}%`}
          subtitle="Completitud media"
          icon={Award}
          color="amber"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Most Viewed */}
        <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              Contenido Más Visto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {metrics?.mostViewed?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay datos disponibles
              </div>
            ) : (
              <div className="space-y-3">
                {metrics?.mostViewed.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.views} visualizaciones</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">{lesson.completionRate}%</p>
                      <p className="text-xs text-slate-500">completado</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Least Completed */}
        <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              Necesita Atención
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {metrics?.leastCompleted?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                ¡Buen trabajo! Todo el contenido tiene buen rendimiento
              </div>
            ) : (
              <div className="space-y-3">
                {metrics?.leastCompleted.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.views} visualizaciones</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-600">{lesson.completionRate}%</p>
                      <p className="text-xs text-slate-500">completado</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <BookOpen className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics?.totalLessons || 0}</p>
                <p className="text-sm text-slate-500">Lecciones totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Users className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics?.newRegistrations || 0}</p>
                <p className="text-sm text-slate-500">Nuevos (30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  primaryColor: string;
  secondaryColor: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, color, primaryColor, secondaryColor }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-cyan-50',
    emerald: 'from-emerald-50 to-green-50',
    violet: 'from-violet-50 to-purple-50',
    amber: 'from-amber-50 to-orange-50',
  };

  const iconColorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-green-600',
    violet: 'from-violet-500 to-purple-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <Card className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-base font-semibold text-slate-700 mb-2">{title}</p>
            <p className="text-5xl font-bold text-slate-900 leading-none">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}
