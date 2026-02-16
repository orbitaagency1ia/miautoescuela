'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  Ban,
  Trash2,
  Sparkles,
  Calendar,
  Users,
  MoreVertical,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/components/ui/toaster';

interface JoinCode {
  id: string;
  code: string;
  status: 'active' | 'revoked' | 'expired' | 'used';
  usedCount: number;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
}

interface JoinCodesManagerProps {
  primaryColor: string;
  secondaryColor: string;
}

export function JoinCodesManager({ primaryColor, secondaryColor }: JoinCodesManagerProps) {
  const [codes, setCodes] = useState<JoinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);
  const [newCodeType, setNewCodeType] = useState<'multi' | 'public'>('multi');
  const [newMaxUses, setNewMaxUses] = useState(50);
  const [newExpiresInDays, setNewExpiresInDays] = useState(7);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools/codes');
      const data = await response.json();

      if (response.ok) {
        setCodes(data.codes || []);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCode = async () => {
    setCreatingCode(true);
    try {
      const response = await fetch('/api/schools/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeType: newCodeType,
          maxUses: newMaxUses,
          expiresInDays: newExpiresInDays,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateDialog(false);
        fetchCodes();
        toast({
          title: 'Código creado',
          description: 'El código de acceso se ha creado correctamente',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo crear el código',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating code:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el código',
        variant: 'destructive',
      });
    } finally {
      setCreatingCode(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyLink = (code: string) => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/elegir-destino?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const updateCode = async (codeId: string, action: 'revoke' | 'regenerate' | 'activate') => {
    try {
      const response = await fetch(`/api/schools/codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchCodes();
        const actionName = action === 'revoke' ? 'revocado' : action === 'regenerate' ? 'regenerado' : 'activado';
        toast({
          title: 'Código actualizado',
          description: `El código se ha ${actionName} correctamente`,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo actualizar el código',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating code:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el código',
        variant: 'destructive',
        });
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este código?')) return;

    try {
      const response = await fetch(`/api/schools/codes/${codeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCodes();
        toast({
          title: 'Código eliminado',
          description: 'El código se ha eliminado correctamente',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el código',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el código',
          variant: 'destructive',
        });
      }
  };

  const getStatusBadge = (code: JoinCode) => {
    const isExpired = isPast(new Date(code.expiresAt));

    if (code.status === 'revoked' || isExpired) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {code.status === 'revoked' ? 'Revocado' : 'Expirado'}
        </Badge>
      );
    }

    if (code.status === 'active') {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Activo
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
        {code.status}
      </Badge>
    );
  };

  return (
    <Card
      className="group relative overflow-hidden border-2 shadow-premium transition-all duration-300"
      style={{
        borderColor: `${primaryColor}30`,
      }}
    >
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Gestión de Códigos de Acceso
          </CardTitle>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Código de Acceso</DialogTitle>
                <DialogDescription>
                  Configura las opciones para tu nuevo código de unión
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Código</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newCodeType === 'multi' ? 'default' : 'outline'}
                      onClick={() => setNewCodeType('multi')}
                      className={cn(
                        'flex-1',
                        newCodeType === 'multi' && 'bg-primary text-primary-foreground'
                      )}
                    >
                      Múltiple
                    </Button>
                    <Button
                      type="button"
                      variant={newCodeType === 'public' ? 'default' : 'outline'}
                      onClick={() => setNewCodeType('public')}
                      className={cn(
                        'flex-1',
                        newCodeType === 'public' && 'bg-primary text-primary-foreground'
                      )}
                    >
                      Público
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Máximo de usos</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    max="1000"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Vigencia (días)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    min="1"
                    max="365"
                    value={newExpiresInDays}
                    onChange={(e) => setNewExpiresInDays(parseInt(e.target.value))}
                  />
                </div>

                <Button
                  onClick={createCode}
                  disabled={creatingCode}
                  className="w-full"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {creatingCode ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Crear Código
                      </>
                    )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 rounded-3xl inline-flex mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
              <Code className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay códigos creados</h3>
            <p className="text-slate-500 mb-6">
              Crea tu primer código de acceso para invitar alumnos
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Código
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="p-4 rounded-xl border-2 bg-white hover:bg-slate-50 transition-all duration-200"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg font-bold"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  >
                    {code.code}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-2 mb-1">
                      <p className="font-semibold text-slate-700">{code.code}</p>
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', code.status === 'active' ? 'bg-emerald-100 text-emerald-700' : code.status === 'revoked' || isPast(new Date(code.expiresAt)) ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600')}>
                        {code.status === 'active' ? 'Activo' : code.status === 'revoked' ? 'Revocado' : 'Expirado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{code.usedCount} / {code.maxUses} usos</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Expira: {format(new Date(code.expiresAt), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    {getStatusBadge(code)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(code.code)}
                      className="shrink-0"
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(code.code)}
                      className="shrink-0"
                    >
                      {copiedLink === code.code ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Code className="h-4 w-4" />
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {code.status === 'active' ? (
                          <DropdownMenuItem onClick={() => updateCode(code.id, 'revoke')}>
                            <Ban className="mr-2 h-4 w-4" />
                            Revocar
                          </DropdownMenuItem>
                          ) : (
                          <DropdownMenuItem onClick={() => updateCode(code.id, 'activate')}>
                            <Check className="mr-2 h-4 w-4" />
                            Activar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => updateCode(code.id, 'regenerate')}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Regenerar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteCode(code.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
