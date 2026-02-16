'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Globe, Mail, Phone, MapPin, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateSchool } from '@/lib/actions/school-actions';

interface EditSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: any;
  onSuccess?: () => void;
}

export function EditSchoolDialog({ open, onOpenChange, school, onSuccess }: EditSchoolDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: school?.name || '',
    slug: school?.slug || '',
    contact_email: school?.contact_email || '',
    phone: school?.phone || '',
    address: school?.address || '',
    website: school?.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await updateSchool(school.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        setSuccess(false);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle>Editar Autoescuela</DialogTitle>
                <DialogDescription>
                  Actualiza la información de tu autoescuela
                </DialogDescription>
              </div>
            </div>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700">
                <div className="p-1 rounded-lg bg-red-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Error al guardar cambios</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                <div className="p-1 rounded-lg bg-emerald-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Cambios guardados correctamente</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Nombre de la Autoescuela <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  id="name"
                  placeholder="Autoescuela Madrid"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  withIcon
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                    Slug (URL)
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Globe className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="slug"
                      placeholder="autoescuela-madrid"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      pattern="[a-z0-9-]+"
                      disabled={loading}
                      withIcon
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-sm font-semibold text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="info@autoescuela.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      disabled={loading}
                      withIcon
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                      withIcon
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700">
                    Dirección
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="address"
                      placeholder="Calle Gran Vía, 123, Madrid"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={loading}
                      withIcon
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
