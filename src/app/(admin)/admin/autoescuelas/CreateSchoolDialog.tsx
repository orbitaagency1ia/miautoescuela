'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, X, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function CreateSchoolDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    ownerEmail: '',
    ownerName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsOpen(false);
        setFormData({
          name: '',
          contactEmail: '',
          phone: '',
          ownerEmail: '',
          ownerName: '',
        });
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear autoescuela');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setFormData({
      name: '',
      contactEmail: '',
      phone: '',
      ownerEmail: '',
      ownerName: '',
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nueva Autoescuela
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[550px]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle>Crear Nueva Autoescuela</DialogTitle>
                  <DialogDescription>
                    Crea una nueva autoescuela y asigna un propietario
                  </DialogDescription>
                </div>
              </div>
              <DialogClose onClick={() => handleClose()} />
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50">
                  <div className="p-1 rounded-lg bg-red-100 shrink-0">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Información importante</p>
                  <p className="text-blue-600">Completa todos los campos obligatorios para crear la autoescuela</p>
                </div>
              </div>

              {/* School Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
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
                      "bg-slate-50 hover:bg-white",
                      "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
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
                        "bg-slate-50 hover:bg-white",
                        "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
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
                        "bg-slate-50 hover:bg-white",
                        "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2">
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
                        "bg-slate-50 hover:bg-white",
                        "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
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
                        "bg-slate-50 hover:bg-white",
                        "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
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
                onClick={handleClose}
                disabled={loading}
                className="rounded-full px-6 h-12"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                {loading ? 'Creando...' : 'Crear Autoescuela'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
