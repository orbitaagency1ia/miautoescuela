'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, Sparkles, Building2, Users, CheckCircle, Clock, XCircle, ChevronRight, Activity, Search, Loader2, RefreshCw, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface School {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  studentCount?: number;
  activeStudentCount?: number;
}

export default function SubscriptionsPage() {
  const supabase = createClient();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalSchools: 0,
    activeCount: 0,
    trialingCount: 0,
    pastDueCount: 0,
    canceledCount: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data: schoolsData } = await (supabase
        .from('schools')
        .select('*') as any)
        .order('created_at', { ascending: false });

      // Get student counts for each school
      const schoolsWithCounts = await Promise.all(
        (schoolsData || []).map(async (school: School) => {
          const { data: members } = await (supabase
            .from('school_members')
            .select('role, status') as any)
            .eq('school_id', school.id);

          const studentCount = members?.filter((m: any) => m.role === 'student').length || 0;
          const activeStudentCount = members?.filter((m: any) => m.role === 'student' && m.status === 'active').length || 0;

          return {
            ...school,
            studentCount,
            activeStudentCount,
          };
        })
      );

      setSchools(schoolsWithCounts);

      // Calculate stats
      const activeCount = schoolsWithCounts.filter((s: School) => s.subscription_status === 'active').length;
      const trialingCount = schoolsWithCounts.filter((s: School) => s.subscription_status === 'trialing').length;
      const pastDueCount = schoolsWithCounts.filter((s: School) => s.subscription_status === 'past_due').length;
      const canceledCount = schoolsWithCounts.filter((s: School) => s.subscription_status === 'canceled').length;

      // Assuming €29/month per active subscription
      const totalRevenue = activeCount * 29;

      setStats({
        totalSchools: schoolsWithCounts.length,
        activeCount,
        trialingCount,
        pastDueCount,
        canceledCount,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Activa',
          gradient: 'from-emerald-500 to-green-500',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100',
          icon: CheckCircle,
        };
      case 'trialing':
        return {
          label: 'Prueba',
          gradient: 'from-blue-500 to-indigo-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          icon: Clock,
        };
      case 'past_due':
        return {
          label: 'Pago Pendiente',
          gradient: 'from-amber-500 to-orange-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
          icon: AlertCircle,
        };
      case 'canceled':
        return {
          label: 'Cancelada',
          gradient: 'from-red-500 to-rose-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          gradient: 'from-slate-500 to-gray-500',
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          iconBg: 'bg-slate-100',
          icon: XCircle,
        };
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    {
      title: 'Total Autoescuelas',
      value: stats.totalSchools,
      icon: Building2,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      description: 'Registradas en plataforma',
    },
    {
      title: 'Suscripciones Activas',
      value: stats.activeCount,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      description: 'Generando ingresos',
    },
    {
      title: 'En Periodo de Prueba',
      value: stats.trialingCount,
      icon: Clock,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      description: 'Prueba gratuita de 14 días',
    },
    {
      title: 'Ingresos Mensuales',
      value: `€${stats.totalRevenue}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      description: `${stats.activeCount} suscripciones × €29`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-6 md:p-8 border-2 border-emerald-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Suscripciones
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-emerald-700 text-sm font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">
                Gestiona las suscripciones de todas las autoescuelas
              </p>
            </div>
            <button
              onClick={fetchSchools}
              disabled={loading}
              className="p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-200"
            >
              <RefreshCw className={cn("h-5 w-5 text-emerald-600", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    <span>Live</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar autoescuela por nombre o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden border-2 border-slate-100">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Suscripciones</h2>
                <p className="text-sm text-slate-500">
                  {filteredSchools.length} {filteredSchools.length === 1 ? 'autoescuela' : 'autoescuelas'}
                  {searchQuery && ` (filtrado de ${schools.length})`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-6 rounded-3xl mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
                <CreditCard className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? 'No se encontraron resultados' : 'Sin datos'}
              </h3>
              <p className="text-slate-500">
                {searchQuery ? 'Prueba con otros términos de búsqueda' : 'No hay suscripciones registradas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchools.map((school, index) => {
                const statusConfig = getStatusConfig(school.subscription_status);
                const StatusIcon = statusConfig.icon;
                return (
                  <Link
                    key={school.id}
                    href={`/admin/autoescuelas/${school.id}`}
                    className="block"
                  >
                    <div
                      className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer select-none"
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />

                      {/* School Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-200`}>
                          {school.name?.slice(0, 2).toUpperCase() || 'AU'}
                        </div>
                      </div>

                      {/* School Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                          {school.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          /{school.slug} • {school.studentCount || 0} alumnos
                        </p>
                      </div>

                      {/* Active Students Badge */}
                      {school.activeStudentCount !== undefined && school.activeStudentCount > 0 && (
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border-2 border-blue-200">
                            <Users className="h-3.5 w-3.5" />
                            {school.activeStudentCount} activos
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <div className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2',
                          statusConfig.bg,
                          statusConfig.text,
                          statusConfig.border
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Trial End Date */}
                      {school.trial_ends_at && school.subscription_status === 'trialing' && (
                        <div className="flex-shrink-0 text-right min-w-[120px]">
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(school.trial_ends_at), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <p className="text-xs text-slate-400">Fin de prueba</p>
                        </div>
                      )}

                      {/* Stripe Status */}
                      <div className="flex-shrink-0">
                        {school.stripe_customer_id ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border-2 border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Conectado
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold border-2 border-slate-200">
                            <XCircle className="h-3.5 w-3.5" />
                            No configurado
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
