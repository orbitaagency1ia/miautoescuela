'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, MoreVertical, Edit, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface School {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  phone: string | null;
  subscription_status: string;
  created_at: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
    const { data, error } = await (supabase
      .from('schools')
      .select('*') as any)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setSchools(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/admin/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        contactEmail: '',
        phone: '',
        ownerEmail: '',
        ownerName: '',
      });
      fetchSchools();
    } else {
      const error = await response.json();
      alert(error.error || 'Error al crear autoescuela');
    }
  };

  const handleDelete = async (schoolId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta autoescuela? Esta acción no se puede deshacer.')) {
      return;
    }

    const response = await fetch(`/api/admin/schools/${schoolId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchSchools();
    } else {
      alert('Error al eliminar autoescuela');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Autoescuelas</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Admin</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Gestiona todas las autoescuelas registradas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Autoescuela
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Listado de Autoescuelas</h3>
          <p className="text-sm text-slate-500">
            {schools.length} {schools.length === 1 ? 'autoescuela registrada' : 'autoescuelas registradas'}
          </p>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : schools.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-muted-foreground">No hay autoescuelas registradas</p>
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Crear Primera Autoescuela
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">Nombre</th>
                  <th className="py-3 px-4 text-left font-medium">Contacto</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-left font-medium">Creada</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-muted-foreground">/{school.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{school.contact_email || '-'}</div>
                      <div className="text-sm text-muted-foreground">{school.phone || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(school.subscription_status)}`}>
                        {getStatusLabel(school.subscription_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={`/admin/autoescuelas/${school.id}`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(school.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create School Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Autoescuela</DialogTitle>
            <DialogDescription>
              Crea una nueva autoescuela y asigna un propietario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Autoescuela *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Autoescuela Madrid"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="info@autoescuela.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Propietario</h3>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nombre Completo *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <Label htmlFor="ownerEmail">Email del Propietario *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="propietario@autoescuela.com"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Se creará una cuenta con una contraseña temporal que se enviará por email.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Autoescuela</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
