'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Globe, Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
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

    const result = await updateSchool(school.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
      onSuccess?.();
    }

    setLoading(false);
  };

  const fields = [
    {
      id: 'name',
      label: 'Nombre de la Autoescuela',
      icon: Building2,
      type: 'text',
      placeholder: 'Autoescuela Madrid',
      required: true,
    },
    {
      id: 'slug',
      label: 'Slug (URL)',
      icon: Globe,
      type: 'text',
      placeholder: 'autoescuela-madrid',
      pattern: '[a-z0-9-]+',
      hint: 'Solo letras minúsculas, números y guiones',
    },
    {
      id: 'contact_email',
      label: 'Email de Contacto',
      icon: Mail,
      type: 'email',
      placeholder: 'contacto@autoescuela.com',
    },
    {
      id: 'phone',
      label: 'Teléfono',
      icon: Phone,
      type: 'tel',
      placeholder: '+34 600 000 000',
    },
    {
      id: 'address',
      label: 'Dirección',
      icon: MapPin,
      type: 'text',
      placeholder: 'Calle Gran Vía, 123, Madrid',
    },
    {
      id: 'website',
      label: 'Sitio Web',
      icon: LinkIcon,
      type: 'url',
      placeholder: 'https://autoescuela.com',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        {/* Header Premium */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold text-slate-900">
                Editar Autoescuela
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                Actualiza la información de tu autoescuela
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      required={field.required}
                      pattern={field.pattern}
                      disabled={loading}
                      className="pl-11 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {field.hint && (
                    <p className="text-xs text-slate-500 ml-1">{field.hint}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer con Glassmorphism */}
          <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="rounded-full px-6 h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
