'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Palette, Image as ImageIcon, Type, Layout, CheckCircle2, Loader2, Sparkles, Eye, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toaster';
import { updateSchoolAction, uploadSchoolLogoAction, uploadSchoolBannerAction } from '@/actions/school';
import { cn } from '@/lib/utils';

// Enhanced color presets with gradients
const colorPresets = [
  { name: 'Azul', primary: '#3B82F6', secondary: '#1E40AF', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Verde', primary: '#10B981', secondary: '#047857', gradient: 'from-emerald-500 to-emerald-700' },
  { name: 'Púrpura', primary: '#8B5CF6', secondary: '#6D28D9', gradient: 'from-violet-500 to-violet-700' },
  { name: 'Naranja', primary: '#F97316', secondary: '#EA580C', gradient: 'from-orange-500 to-orange-700' },
  { name: 'Rojo', primary: '#EF4444', secondary: '#DC2626', gradient: 'from-red-500 to-red-700' },
  { name: 'Rosa', primary: '#EC4899', secondary: '#DB2777', gradient: 'from-pink-500 to-pink-700' },
  { name: 'Cian', primary: '#06B6D4', secondary: '#0891B2', gradient: 'from-cyan-500 to-cyan-700' },
  { name: 'Índigo', primary: '#6366F1', secondary: '#4F46E5', gradient: 'from-indigo-500 to-indigo-700' },
  { name: 'Amarillo', primary: '#EAB308', secondary: '#CA8A04', gradient: 'from-yellow-500 to-yellow-700' },
  { name: 'Lima', primary: '#84CC16', secondary: '#65A30D', gradient: 'from-lime-500 to-lime-700' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#0D9488', gradient: 'from-teal-500 to-teal-700' },
  { name: 'Gris', primary: '#6B7280', secondary: '#374151', gradient: 'from-gray-500 to-gray-700' },
];

const DEFAULT_COLORS = {
  primary: '#3B82F6',
  secondary: '#1E40AF',
};

interface ConfiguracionFormProps {
  school: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    banner_url: string | null;
    welcome_message: string | null;
    contact_email: string | null;
    phone: string | null;
    address: string | null;
    website: string | null;
  };
  onUpdate?: (school: any) => void;
}

export function ConfiguracionForm({ school, onUpdate }: ConfiguracionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Form state with local updates
  const [generalData, setGeneralData] = useState({
    name: school.name || '',
    contact_email: school.contact_email || '',
    phone: school.phone || '',
    website: school.website || '',
    address: school.address || '',
  });

  const [brandingData, setBrandingData] = useState({
    primary_color: school.primary_color || '#3B82F6',
    secondary_color: school.secondary_color || '#1E40AF',
    welcome_message: school.welcome_message || '',
  });

  // Local state for images (preview without reload)
  const [localLogoUrl, setLocalLogoUrl] = useState(school.logo_url);
  const [localBannerUrl, setLocalBannerUrl] = useState(school.banner_url);

  // Upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Saving states
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingColors, setIsSavingColors] = useState(false);
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  // Show preview state
  const [showPreview, setShowPreview] = useState(true);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);

    const result = await updateSchoolAction(school.id, generalData);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '✨ Información actualizada',
        description: 'Los cambios se han guardado correctamente',
        variant: 'success',
      });
      onUpdate?.({ ...school, ...generalData });
      router.refresh();
    }

    setIsSavingGeneral(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadSchoolLogoAction(school.id, formData);

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '✨ Logo actualizado',
        description: 'Tu logo se ha actualizado correctamente',
        variant: 'success',
      });
      setLocalLogoUrl(result.logoUrl ?? null);
      onUpdate?.({ ...school, logo_url: result.logoUrl ?? null });
      router.refresh();
    }

    setTimeout(() => {
      setIsUploadingLogo(false);
      setUploadProgress(0);
    }, 500);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadSchoolBannerAction(school.id, formData);

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '✨ Banner actualizado',
        description: 'Tu banner se ha actualizado correctamente',
        variant: 'success',
      });
      setLocalBannerUrl(result.bannerUrl ?? null);
      onUpdate?.({ ...school, banner_url: result.bannerUrl ?? null });
      router.refresh();
    }

    setTimeout(() => {
      setIsUploadingBanner(false);
      setUploadProgress(0);
    }, 500);
  };

  const handleColorSave = async () => {
    setIsSavingColors(true);

    const result = await updateSchoolAction(school.id, {
      primary_color: brandingData.primary_color,
      secondary_color: brandingData.secondary_color,
    });

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '✨ Colores actualizados',
        description: 'Los colores se han guardado correctamente',
        variant: 'success',
      });
      onUpdate?.({
        ...school,
        primary_color: brandingData.primary_color,
        secondary_color: brandingData.secondary_color,
      });
      router.refresh();
    }

    setIsSavingColors(false);
  };

  const handleWelcomeMessageSave = async () => {
    setIsSavingMessage(true);

    const result = await updateSchoolAction(school.id, {
      welcome_message: brandingData.welcome_message,
    });

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '✨ Mensaje actualizado',
        description: 'El mensaje de bienvenida se ha guardado',
        variant: 'success',
      });
      onUpdate?.({ ...school, welcome_message: brandingData.welcome_message });
      router.refresh();
    }

    setIsSavingMessage(false);
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setBrandingData({
      ...brandingData,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
    });
  };

  const resetColors = () => {
    setBrandingData({
      ...brandingData,
      primary_color: DEFAULT_COLORS.primary,
      secondary_color: DEFAULT_COLORS.secondary,
    });
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto">
        <TabsTrigger
          value="general"
          className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
        >
          General
        </TabsTrigger>
        <TabsTrigger
          value="branding"
          className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
        >
          <Palette className="mr-2 h-4 w-4" />
          Branding
        </TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general" className="space-y-6 animate-fade-in">
        <Card className="border-2 border-border/50 shadow-premium overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Información de la Autoescuela</CardTitle>
                <CardDescription>
                  Datos básicos de tu escuela que aparecerán en la plataforma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 group">
                  <Label htmlFor="school-name" className="text-sm font-medium">
                    Nombre de la Autoescuela
                  </Label>
                  <Input
                    id="school-name"
                    value={generalData.name}
                    onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                    placeholder="Autoescuela Central"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Email de Contacto
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={generalData.contact_email}
                    onChange={(e) => setGeneralData({ ...generalData, contact_email: e.target.value })}
                    placeholder="contacto@autoescuela.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={generalData.phone}
                    onChange={(e) => setGeneralData({ ...generalData, phone: e.target.value })}
                    placeholder="+34 900 123 456"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={generalData.website}
                    onChange={(e) => setGeneralData({ ...generalData, website: e.target.value })}
                    placeholder="https://autoescuela.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                <Input
                  id="address"
                  value={generalData.address}
                  onChange={(e) => setGeneralData({ ...generalData, address: e.target.value })}
                  placeholder="Calle Ejemplo 123, Madrid"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingGeneral}
                  className="rounded-full px-8 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:scale-105"
                >
                  {isSavingGeneral ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Branding Settings */}
      <TabsContent value="branding" className="space-y-6 animate-fade-in">
        {/* Logo and Banner */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Logo Upload */}
          <Card className="lg:col-span-1 border-2 border-border/50 shadow-premium hover:shadow-premium-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                Logo
              </CardTitle>
              <CardDescription>
                Tu logo aparecerá en la cabecera y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="aspect-square rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/30 p-6 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300"
              >
                {localLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localLogoUrl}
                    alt="Logo preview"
                    className="w-32 h-32 rounded-xl object-contain shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 inline-block mb-3">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No hay logo configurado</p>
                  </div>
                )}
                {isUploadingLogo && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">{uploadProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                className="w-full rounded-full border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                PNG, JPG hasta 2MB
              </p>
            </CardContent>
          </Card>

          {/* Banner Upload */}
          <Card className="lg:col-span-2 border-2 border-border/50 shadow-premium hover:shadow-premium-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Layout className="h-4 w-4 text-white" />
                </div>
                Banner Principal
              </CardTitle>
              <CardDescription>
                Imagen de fondo para la página de inicio de tus alumnos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="aspect-video rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/30 p-6 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300"
              >
                {localBannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localBannerUrl}
                    alt="Banner preview"
                    className="w-full h-full rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 inline-block mb-3">
                      <Layout className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No hay banner configurado</p>
                  </div>
                )}
                {isUploadingBanner && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">{uploadProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <Button
                variant="outline"
                className="rounded-full border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
              >
                {isUploadingBanner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Banner
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG hasta 5MB. Recomendado: 1920x600px
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Colors */}
        <Card className="border-2 border-border/50 shadow-premium">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Colores de Marca</CardTitle>
                  <CardDescription>
                    Personaliza los colores que representan tu autoescuela
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Custom Colors */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="primary-color" className="text-sm font-medium">Color Principal</Label>
                <div className="flex gap-3">
                  <div className="relative">
                    <Input
                      id="primary-color"
                      type="color"
                      value={brandingData.primary_color}
                      onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                      className="w-20 h-14 rounded-xl cursor-pointer overflow-hidden p-1 border-2"
                    />
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-primary/20"
                      style={{ backgroundColor: brandingData.primary_color }}
                    />
                  </div>
                  <Input
                    value={brandingData.primary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                    className="flex-1 font-mono uppercase text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usado para botones principales y enlaces
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="secondary-color" className="text-sm font-medium">Color Secundario</Label>
                <div className="flex gap-3">
                  <div className="relative">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={brandingData.secondary_color}
                      onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                      className="w-20 h-14 rounded-xl cursor-pointer overflow-hidden p-1 border-2"
                    />
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-secondary/20"
                      style={{ backgroundColor: brandingData.secondary_color }}
                    />
                  </div>
                  <Input
                    value={brandingData.secondary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                    className="flex-1 font-mono uppercase text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usado para fondos y acentos
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Paletas Predefinidas
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetColors}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Restablecer
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "group relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                      brandingData.primary_color === preset.primary && brandingData.secondary_color === preset.secondary
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border/50 hover:border-primary/50"
                    )}
                  >
                    <div className="relative flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-5 h-5 rounded-md shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-md shadow-sm"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <span className="text-xs font-medium">{preset.name}</span>
                    </div>
                    {brandingData.primary_color === preset.primary && brandingData.secondary_color === preset.secondary && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div
                className={cn(
                  "p-6 rounded-2xl border-2 bg-gradient-to-br transition-all duration-500",
                  brandingData.primary_color === '#3B82F6' && brandingData.secondary_color === '#1E40AF'
                    ? "from-blue-50 to-indigo-50 border-blue-100"
                    : "border-border/50"
                )}
                style={{
                  background: `linear-gradient(135deg, ${brandingData.primary_color}08 0%, ${brandingData.secondary_color}08 100%)`,
                  borderColor: `${brandingData.primary_color}20`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Vista Previa</p>
                </div>
                <div className="space-y-4">
                  <div
                    className="px-6 py-3 rounded-xl text-white text-center font-semibold shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${brandingData.primary_color} 0%, ${brandingData.secondary_color} 100%)`,
                      boxShadow: `0 4px 20px ${brandingData.primary_color}40`
                    }}
                  >
                    Botón Principal
                  </div>
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${brandingData.primary_color} 0%, ${brandingData.secondary_color} 100%)`,
                      }}
                    >
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <div
                      className="flex-1 h-20 rounded-2xl shadow-inner transition-all duration-300"
                      style={{ backgroundColor: brandingData.secondary_color }}
                    >
                      <div className="h-full flex items-center justify-center text-white/60 text-sm">
                        Banner / Fondo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                className="rounded-full px-8 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${brandingData.primary_color} 0%, ${brandingData.secondary_color} 100%)`,
                }}
                onClick={handleColorSave}
                disabled={isSavingColors}
              >
                {isSavingColors ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Guardar Colores
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="border-2 border-border/50 shadow-premium">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Type className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Mensaje de Bienvenida</CardTitle>
                <CardDescription>
                  Mensaje personalizado que verán tus alumnos al iniciar sesión
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              id="welcome-message"
              value={brandingData.welcome_message}
              onChange={(e) => setBrandingData({ ...brandingData, welcome_message: e.target.value })}
              placeholder="¡Bienvenido a [Nombre de tu Autoescuela]! Estamos aquí para ayudarte a obtener tu licencia de conducción."
              rows={4}
              className="resize-none rounded-xl border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Info className="h-4 w-4 flex-shrink-0" />
              <p>Puedes usar [Nombre] para incluir el nombre del alumno automáticamente</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="rounded-full px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={handleWelcomeMessageSave}
                disabled={isSavingMessage}
              >
                {isSavingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Guardar Mensaje
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
