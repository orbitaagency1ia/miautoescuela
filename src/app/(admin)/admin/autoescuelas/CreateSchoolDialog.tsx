'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nueva Autoescuela
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Crear Nueva Autoescuela</h2>
                  <p className="text-sm text-gray-500">Crea una nueva autoescuela y asigna un propietario</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre de la Autoescuela <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Autoescuela Madrid"
                  required
                  disabled={loading}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                  Email de Contacto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="info@autoescuela.com"
                  required
                  disabled={loading}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  disabled={loading}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Propietario</h3>
                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    disabled={loading}
                    className="h-10 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <Label htmlFor="ownerEmail" className="text-sm font-medium text-gray-700">
                    Email del Propietario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="propietario@autoescuela.com"
                    required
                    disabled={loading}
                    className="h-10 rounded-xl border-gray-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Se creará una cuenta con una contraseña temporal que se enviará por email.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl h-10 px-5 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl h-10 px-5 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Creando...' : 'Crear Autoescuela'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
