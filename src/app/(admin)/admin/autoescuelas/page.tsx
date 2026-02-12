'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Plus, Edit, Trash2, X, Sparkles, Loader2, AlertCircle, CheckCircle2, Search, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const { data, error } = await (supabase
        .from('schools')
        .select('*') as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      setApiError('Error al cargar las autoescuelas. Por favor, intenta de nuevo.');
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

      // Clear success message after 3 seconds
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'past_due':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'canceled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'trialing':
        return 'Prueba';
      case 'past_due':
        return 'Pago Pendiente';
      case 'canceled':
        return 'Cancelada';
      case 'incomplete':
        return 'Incompleta';
      default:
        return status;
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Autoescuelas</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">Admin</span>
            </div>
          </div>
          <p className="text-slate-500">
            Gestiona todas las autoescuelas registradas
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Autoescuela
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {apiError && (
        <Alert className="bg-red-50 border-2 border-red-200 text-red-800 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors duration-200 focus-within:text-blue-500" strokeWidth={2} />
          <Input
            type="text"
            placeholder="Buscar por nombre, slug o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 rounded-2xl border-2 border-slate-200 h-12 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
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
      <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in border-2 border-slate-100" style={{ animationDelay: '150ms' }}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Listado de Autoescuelas</h3>
          <p className="text-sm text-slate-500">
            {filteredSchools.length} {filteredSchools.length === 1 ? 'autoescuela registrada' : 'autoescuelas registradas'}
            {searchQuery && ` (filtrado de ${schools.length})`}
          </p>
        </div>

        {/* Loading State */}
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
          /* Empty State */
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex p-8 rounded-[20px] bg-gradient-to-br from-blue-50 to-indigo-50 mb-6">
              <Building2 className="h-16 w-16 text-blue-500" />
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
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Autoescuela
              </Button>
            )}
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Autoescuela</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Contacto</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Estado</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Creada</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-700 w-20">Acciones</th>
                  <th className="py-3 px-4 text-center font-semibold text-slate-700 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school, index) => (
                  <tr
                    key={school.id}
                    className="border-b border-slate-100 hover:bg-blue-50/50 hover:border-blue-100/50 transition-all duration-200 group animate-fade-in cursor-pointer select-none"
                    style={{ animationDelay: `${200 + Math.min(index * 50, 400)}ms` }}
                    onClick={(e) => {
                      // Prevent navigation if clicking on action buttons
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
                      <div className="text-slate-700">{school.contact_email || '-'}</div>
                      <div className="text-sm text-slate-500">{school.phone || ''}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border', getStatusColor(school.subscription_status))}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                        {getStatusLabel(school.subscription_status)}
                      </span>
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
                          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <a href={`/admin/autoescuelas/${school.id}`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(school.id);
                          }}
                          className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                          disabled={isDeleting}
                        >
                          {isDeleting && deleteConfirm === school.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Autoescuela</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta autoescuela.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              ¿Estás seguro de que quieres eliminar esta autoescuela? Se perderán todos los alumnos, temas y contenido asociado.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isDeleting}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Autoescuela</DialogTitle>
            <DialogDescription>
              Crea una nueva autoescuela y asigna un propietario
            </DialogDescription>
          </DialogHeader>

          {apiError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className={formError?.field === 'name' ? 'text-red-600' : ''}>
                  Nombre de la Autoescuela *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Autoescuela Madrid"
                  className={cn('rounded-xl border-2', formError?.field === 'name' && 'border-red-300 focus:border-red-500')}
                  disabled={isSubmitting}
                />
                {formError?.field === 'name' && (
                  <p className="text-sm text-red-600">{formError.message}</p>
                )}
              </div>

              {/* Email Contacto */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className={formError?.field === 'contactEmail' ? 'text-red-600' : ''}>
                  Email de Contacto *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="info@autoescuela.com"
                  className={cn('rounded-xl border-2', formError?.field === 'contactEmail' && 'border-red-300 focus:border-red-500')}
                  disabled={isSubmitting}
                />
                {formError?.field === 'contactEmail' && (
                  <p className="text-sm text-red-600">{formError.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="rounded-xl border-2"
                  disabled={isSubmitting}
                />
              </div>

              {/* Separator */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  Propietario
                </h3>

                {/* Nombre Propietario */}
                <div className="space-y-2">
                  <Label htmlFor="ownerName" className={formError?.field === 'ownerName' ? 'text-red-600' : ''}>
                    Nombre Completo *
                  </Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Juan Pérez"
                    className={cn('rounded-xl border-2', formError?.field === 'ownerName' && 'border-red-300 focus:border-red-500')}
                    disabled={isSubmitting}
                  />
                  {formError?.field === 'ownerName' && (
                    <p className="text-sm text-red-600">{formError.message}</p>
                  )}
                </div>

                {/* Email Propietario */}
                <div className="space-y-2 mt-3">
                  <Label htmlFor="ownerEmail" className={formError?.field === 'ownerEmail' ? 'text-red-600' : ''}>
                    Email del Propietario *
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="propietario@autoescuela.com"
                    className={cn('rounded-xl border-2', formError?.field === 'ownerEmail' && 'border-red-300 focus:border-red-500')}
                    disabled={isSubmitting}
                  />
                  {formError?.field === 'ownerEmail' && (
                    <p className="text-sm text-red-600">{formError.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Se creará una cuenta con contraseña temporal
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl shadow-lg"
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
