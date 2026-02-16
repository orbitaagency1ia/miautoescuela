'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Plus, Edit, Trash2, X, Sparkles, Loader2, AlertCircle, CheckCircle2, Search, ChevronRight, Info, Mail, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SchoolMember {
  profiles: {
    email: string;
    full_name: string;
  };
  role: string;
}

interface School {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  phone: string | null;
  subscription_status: string;
  created_at: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  members?: SchoolMember[];
}

type FormError = {
  field?: string;
  message: string;
};

type ApiError = {
  error: string;
  details?: string;
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<FormError | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    ownerEmail: '',
    ownerName: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSchools();
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User data:', user);
      console.log('User metadata:', user?.user_metadata);
      console.log('User email:', user?.email);
      // Check by email or role
      if (
        user?.user_metadata?.role === 'admin' ||
        user?.email?.includes('@miautoescuela.com') ||
        user?.email?.includes('@admin.com') ||
        user?.email === 'kevinubeda231@gmail.com'
      ) {
        setIsSuperAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    setApiError(null);
    try {
      console.log('Fetching schools from API...');

      // Usar la API en lugar del cliente para evitar problemas con JOINs
      const response = await fetch('/api/admin/schools');

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Error al cargar las autoescuelas');
      }

      const result = await response.json();
      console.log('Schools data from API:', result);

      setSchools(result.schools || []);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      setApiError(error?.message || 'Error al cargar las autoescuelas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): FormError | null => {
    if (!formData.name || formData.name.trim().length < 2) {
      return { field: 'name', message: 'El nombre debe tener al menos 2 caracteres' };
    }
    if (!formData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      return { field: 'contactEmail', message: 'Introduce un email válido' };
    }
    if (!formData.ownerName || formData.ownerName.trim().length < 2) {
      return { field: 'ownerName', message: 'El nombre del propietario es obligatorio' };
    }
    if (!formData.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      return { field: 'ownerEmail', message: 'Introduce un email válido para el propietario' };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setApiError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: ApiError = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear autoescuela');
      }

      setSuccessMessage('Autoescuela creada correctamente');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSchools();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error creating school:', error);
      setApiError(error.message || 'Error al crear autoescuela');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactEmail: '',
      phone: '',
      ownerEmail: '',
      ownerName: '',
    });
    setFormError(null);
    setApiError(null);
  };

  const handleDelete = async (schoolId: string) => {
    setIsDeleting(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Error al eliminar autoescuela');
      }

      setSuccessMessage('Autoescuela eliminada correctamente');
      setDeleteConfirm(null);
      fetchSchools();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting school:', error);
      setApiError(error.message || 'Error al eliminar autoescuela');
    } finally {
      setIsDeleting(false);
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
        };
      case 'trialing':
        return {
          label: 'Prueba',
          gradient: 'from-blue-500 to-indigo-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        };
      case 'past_due':
        return {
          label: 'Pago Pendiente',
          gradient: 'from-amber-500 to-orange-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
        };
      case 'canceled':
        return {
          label: 'Cancelada',
          gradient: 'from-red-500 to-rose-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        };
      default:
        return {
          label: status,
          gradient: 'from-slate-500 to-gray-500',
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
        };
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 md:p-8 border-2 border-blue-100">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Autoescuelas</h1>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-blue-700 text-sm font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </div>
                </div>
                <p className="text-slate-600">
                  Gestiona todas las autoescuelas registradas en la plataforma
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-full px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-white font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Autoescuela
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {apiError && (
        <Alert className="bg-red-50 border-2 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, slug o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 rounded-2xl border-2 border-slate-200 h-12 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Schools List */}
      <div className="bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden border-2 border-slate-100">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Listado de Autoescuelas</h3>
                <p className="text-sm text-slate-500">
                  {filteredSchools.length} {filteredSchools.length === 1 ? 'autoescuela registrada' : 'autoescuelas registradas'}
                  {searchQuery && ` (filtrado de ${schools.length})`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-slate-100 animate-pulse rounded" />
                    <div className="h-3 w-32 bg-slate-50 animate-pulse rounded" />
                  </div>
                  <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 mb-6">
                <Building2 className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {searchQuery ? 'No se encontraron resultados' : 'No hay autoescuelas registradas'}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? 'Prueba con otros términos de búsqueda'
                  : 'Comienza creando la primera autoescuela en la plataforma'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="rounded-full px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-white font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Autoescuela
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Autoescuela</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Contacto</th>
                    {isSuperAdmin && (
                      <th className="py-3 px-4 text-left font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          Propietarios
                        </div>
                      </th>
                    )}
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Estado</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Creada</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-700 w-20">Acciones</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-700 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => {
                    const statusConfig = getStatusConfig(school.subscription_status);
                    return (
                      <tr
                        key={school.id}
                        className="border-b border-slate-100 hover:bg-blue-50/50 hover:border-blue-100/50 transition-all duration-200 group cursor-pointer select-none"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                            return;
                          }
                          window.location.href = `/admin/autoescuelas/${school.id}`;
                        }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {school.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={school.logo_url}
                                alt={school.name}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:scale-105 transition-transform"
                                style={{
                                  background: `linear-gradient(135deg, ${school.primary_color || '#3B82F6'} 0%, ${school.secondary_color || '#1E40AF'} 100%)`,
                                }}
                              >
                                {school.name?.slice(0, 2).toUpperCase() || 'AU'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{school.name}</div>
                              <div className="text-sm text-slate-500">/{school.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-700 text-sm">{school.contact_email || '-'}</div>
                          <div className="text-xs text-slate-500">{school.phone || ''}</div>
                        </td>
                        {isSuperAdmin && (
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              {(school.members?.filter((m: SchoolMember) => m.role === 'owner' || m.role === 'admin') || []).map((member: SchoolMember, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Shield className={cn(
                                    "h-3.5 w-3.5",
                                    member.role === 'owner' ? "text-amber-600" : "text-blue-600"
                                  )} />
                                  <span className="text-slate-700">{member.profiles?.email || 'Sin email'}</span>
                                  <span className="text-xs text-slate-400">({member.role === 'owner' ? 'Propietario' : 'Admin'})</span>
                                </div>
                              ))}
                              {(!school.members || school.members.filter((m: SchoolMember) => m.role === 'owner' || m.role === 'admin').length === 0) && (
                                <span className="text-sm text-slate-400 italic">Sin propietarios</span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <div className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2',
                            statusConfig.bg,
                            statusConfig.text,
                            statusConfig.border
                          )}>
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                              <a href={`/admin/autoescuelas/${school.id}`}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(school.id);
                              }}
                              className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 transition-colors"
                              disabled={isDeleting}
                            >
                              {isDeleting && deleteConfirm === school.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 mx-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle>Eliminar Autoescuela</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer
                  </DialogDescription>
                </div>
              </div>
              <DialogClose onClick={() => setDeleteConfirm(null)} />
            </div>
          </DialogHeader>

          <div className="px-8 py-6 space-y-6">
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Advertencia importante</p>
                <p className="text-amber-700">Esta acción eliminará permanentemente la autoescuela y todos los datos asociados, incluyendo alumnos, temas y contenido.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
              className="rounded-full px-6 h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isDeleting}
              className="rounded-full px-6 h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md text-white font-medium"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar Autoescuela'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create School Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetForm();
    }
  }}>
        <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle>Crear Nueva Autoescuela</DialogTitle>
                  <DialogDescription>
                    Crea una nueva autoescuela y asigna un propietario
                  </DialogDescription>
                </div>
              </div>
              <DialogClose onClick={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 space-y-5">
              {apiError && (
                <div className="flex items-start gap-3 p-4 rounded-xl border-2 bg-red-50">
                  <div className="p-1 rounded-lg bg-red-100 shrink-0">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Información importante</p>
                  <p className="text-blue-600">Completa todos los campos obligatorios para crear la autoescuela</p>
                </div>
              </div>

              {/* School Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Información de la Autoescuela</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Nombre de la Autoescuela <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Autoescuela Madrid"
                    className={cn(
                      "h-12 rounded-xl text-slate-900 text-base",
                      "border-2 border-slate-300",
                      "bg-slate-50 hover:bg-white",
                      "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                      "placeholder:text-slate-400",
                      "transition-all duration-200"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-semibold text-slate-700">
                      Email de Contacto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="info@autoescuela.com"
                      className={cn(
                        "h-12 rounded-xl text-slate-900 text-base",
                        "border-2 border-slate-300",
                        "bg-slate-50 hover:bg-white",
                        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                      className={cn(
                        "h-12 rounded-xl text-slate-900 text-base",
                        "border-2 border-slate-300",
                        "bg-slate-50 hover:bg-white",
                        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Propietario</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-semibold text-slate-700">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Juan Pérez"
                      className={cn(
                        "h-12 rounded-xl text-slate-900 text-base",
                        "border-2 border-slate-300",
                        "bg-slate-50 hover:bg-white",
                        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail" className="text-sm font-semibold text-slate-700">
                      Email del Propietario <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      placeholder="propietario@autoescuela.com"
                      className={cn(
                        "h-12 rounded-xl text-slate-900 text-base",
                        "border-2 border-slate-300",
                        "bg-slate-50 hover:bg-white",
                        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Cuenta de propietario</p>
                    <p className="text-emerald-600">Se creará una cuenta con una contraseña temporal que se enviará por email.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-full px-6 h-12"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Autoescuela'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
