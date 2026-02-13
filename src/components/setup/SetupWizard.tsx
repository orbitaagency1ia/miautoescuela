'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Loader2, ChevronLeft, ChevronRight, Check, Palette, Mail, FileText, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupWizardProps {
  userId: string;
  userEmail: string;
}

interface WizardData {
  // Step 1: Basic Info
  name: string;
  slug: string;
  logo?: File;
  logoPreview?: string;

  // Step 2: Branding
  primaryColor: string;
  secondaryColor: string;
  banner?: File;
  bannerPreview?: string;
  welcomeMessage: string;
  website: string;

  // Step 3: Contact
  contactEmail: string;
  phone: string;
  address: string;

  // Step 4: Content
  createFirstModule: boolean;
  firstModuleName: string;
  firstModuleDescription: string;

  // Step 5: Invitations
  inviteStudents: boolean;
  studentEmails: string;
}

const steps = [
  { id: 1, title: 'Info Básica', icon: Building2 },
  { id: 2, title: 'Branding', icon: Palette },
  { id: 3, title: 'Contacto', icon: Mail },
  { id: 4, title: 'Contenido', icon: FileText },
  { id: 5, title: 'Invitaciones', icon: Users },
];

export default function SetupWizard({ userId, userEmail }: SetupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    name: '',
    slug: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    welcomeMessage: '¡Bienvenido a tu plataforma de formación!',
    website: '',
    contactEmail: userEmail,
    phone: '',
    address: '',
    createFirstModule: true,
    firstModuleName: 'Módulo 1: Introducción',
    firstModuleDescription: 'Conceptos básicos para comenzar tu formación',
    inviteStudents: false,
    studentEmails: '',
  });

  const updateData = (field: keyof WizardData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData('logo', file);
      updateData('logoPreview', URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData('banner', file);
      updateData('bannerPreview', URL.createObjectURL(file));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    updateData('name', value);
    if (!data.slug || data.slug === generateSlug(data.name)) {
      updateData('slug', generateSlug(value));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!data.name && !!data.slug;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        if (data.createFirstModule) {
          return !!data.firstModuleName;
        }
        return true;
      case 5:
        if (data.inviteStudents) {
          const emails = data.studentEmails.split('\n').filter(e => e.trim());
          return emails.length > 0;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
      } else {
        submitWizard();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitWizard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      formData.append('userId', userId);
      formData.append('userEmail', userEmail);
      formData.append('userName', userEmail.split('@')[0]);

      // Branding data
      formData.append('primaryColor', data.primaryColor);
      formData.append('secondaryColor', data.secondaryColor);
      formData.append('welcomeMessage', data.welcomeMessage);
      formData.append('website', data.website);

      // Contact data
      formData.append('contactEmail', data.contactEmail);
      formData.append('phone', data.phone);
      formData.append('address', data.address);

      // Content data
      formData.append('createFirstModule', data.createFirstModule.toString());
      if (data.createFirstModule) {
        formData.append('firstModuleName', data.firstModuleName);
        formData.append('firstModuleDescription', data.firstModuleDescription);
      }

      // Invitations data
      formData.append('inviteStudents', data.inviteStudents.toString());
      if (data.inviteStudents) {
        formData.append('studentEmails', data.studentEmails);
      }

      // Files
      if (data.logo) formData.append('logo', data.logo);
      if (data.banner) formData.append('banner', data.banner);

      const response = await fetch('/api/setup/create-school', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la autoescuela');
      }

      router.push('/panel');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la autoescuela');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Información Básica</h3>
              <p className="text-muted-foreground mb-6">
                Comencemos con la información fundamental de tu autoescuela
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Autoescuela *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Autoescuela Madrid"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL única (slug) *</Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => updateData('slug', generateSlug(e.target.value))}
                  placeholder="Ej: autoescuela-madrid"
                  pattern="[a-z0-9-]+"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números y guiones. Sin espacios.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo (opcional)</Label>
                <div className="flex items-center gap-4">
                  {data.logoPreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200">
                      <img src={data.logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          updateData('logo', undefined);
                          updateData('logoPreview', undefined);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </label>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary transition-colors text-center">
                        Click para subir o arrastra tu logo
                      </div>
                    </Label>
                    <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Personalización Visual</h3>
              <p className="text-muted-foreground mb-6">
                Define los colores y la imagen de marca de tu escuela
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={data.primaryColor}
                      onChange={(e) => updateData('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2"
                      disabled={isLoading}
                    />
                    <Input
                      value={data.primaryColor}
                      onChange={(e) => updateData('primaryColor', e.target.value)}
                      className="flex-1 font-mono"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={data.secondaryColor}
                      onChange={(e) => updateData('secondaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2"
                      disabled={isLoading}
                    />
                    <Input
                      value={data.secondaryColor}
                      onChange={(e) => updateData('secondaryColor', e.target.value)}
                      className="flex-1 font-mono"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2" style={{
                background: `linear-gradient(135deg, ${data.primaryColor}15 0%, ${data.secondaryColor}15 100%)`,
                borderColor: `${data.primaryColor}30`,
              }}>
                <p className="text-sm font-medium mb-2">Vista previa</p>
                <Button style={{
                  background: `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`,
                }}>
                  Ver ejemplo de botón
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Banner Principal (opcional)</Label>
                {data.bannerPreview ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-slate-200">
                    <img src={data.bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        updateData('banner', undefined);
                        updateData('bannerPreview', undefined);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    <div className="text-center text-slate-400">
                      <Palette className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Click para subir banner</p>
                    </div>
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea
                  id="welcomeMessage"
                  value={data.welcomeMessage}
                  onChange={(e) => updateData('welcomeMessage', e.target.value)}
                  placeholder="Mensaje que verán tus alumnos al entrar..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web (opcional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={data.website}
                  onChange={(e) => updateData('website', e.target.value)}
                  placeholder="https://tuautoescuela.com"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Información de Contacto</h3>
              <p className="text-muted-foreground mb-6">
                Cómo tus alumnos pueden ponerse en contacto contigo
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => updateData('contactEmail', e.target.value)}
                  placeholder="contacto@autoescuela.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  placeholder="+34 600 123 456"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección Física (opcional)</Label>
                <Textarea
                  id="address"
                  value={data.address}
                  onChange={(e) => updateData('address', e.target.value)}
                  placeholder="Calle Ejemplo, 123, 28001 Madrid"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contenido Inicial</h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primer módulo de contenido ahora o hazlo más tarde
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Crear primer módulo</p>
                    <p className="text-sm text-muted-foreground">Empieza con un módulo de introducción</p>
                  </div>
                </div>
                <button
                  onClick={() => updateData('createFirstModule', !data.createFirstModule)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    data.createFirstModule ? "bg-primary" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      data.createFirstModule ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {data.createFirstModule && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
                  <div className="space-y-2">
                    <Label htmlFor="firstModuleName">Nombre del Módulo *</Label>
                    <Input
                      id="firstModuleName"
                      value={data.firstModuleName}
                      onChange={(e) => updateData('firstModuleName', e.target.value)}
                      placeholder="Ej: Módulo 1: Introducción"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstModuleDescription">Descripción</Label>
                    <Textarea
                      id="firstModuleDescription"
                      value={data.firstModuleDescription}
                      onChange={(e) => updateData('firstModuleDescription', e.target.value)}
                      placeholder="Descripción breve del contenido..."
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Invitar Alumnos</h3>
              <p className="text-muted-foreground mb-6">
                Comparte tu escuela con tus primeros alumnos (opcional)
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Invitar alumnos ahora</p>
                    <p className="text-sm text-muted-foreground">Añade alumnos más tarde si prefieres</p>
                  </div>
                </div>
                <button
                  onClick={() => updateData('inviteStudents', !data.inviteStudents)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    data.inviteStudents ? "bg-primary" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      data.inviteStudents ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {data.inviteStudents && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
                  <div className="space-y-2">
                    <Label htmlFor="studentEmails">Emails de Alumnos (uno por línea)</Label>
                    <Textarea
                      id="studentEmails"
                      value={data.studentEmails}
                      onChange={(e) => updateData('studentEmails', e.target.value)}
                      placeholder="alumno1@example.com&#10;alumno2@example.com&#10;alumno3@example.com"
                      rows={6}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se enviarán invitaciones a todos los emails listados
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-white",
                      isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-slate-200 text-slate-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1 font-medium hidden sm:block",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      isCompleted ? "bg-primary" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-premium">
        <CardContent className="p-8">
          {renderStep()}

          {error && (
            <div className="mt-6 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="rounded-full"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <Button
              type="button"
              onClick={nextStep}
              disabled={!validateStep(currentStep) || isLoading}
              className="rounded-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : currentStep === 5 ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Crear Autoescuela
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
