'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { isInstallPromptAvailable, promptInstall, isPWAInstalled } from '@/lib/pwa/register-sw';

interface InstallPromptProps {
  primaryColor: string;
  secondaryColor: string;
}

export function InstallPrompt({ primaryColor, secondaryColor }: InstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    if (isPWAInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt availability
    const handlePromptAvailable = () => {
      if (!hasClosed) {
        // Show dialog after a short delay
        setTimeout(() => setIsOpen(true), 3000);
      }
    };

    window.addEventListener('sw-install-prompt-available', handlePromptAvailable);

    return () => {
      window.removeEventListener('sw-install-prompt-available', handlePromptAvailable);
    };
  }, [hasClosed]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsOpen(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setHasClosed(true);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Download className="h-6 w-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <DialogTitle>Instalar Aplicación</DialogTitle>
              <DialogDescription>
                Instala mIAutoescuela en tu dispositivo para una mejor experiencia
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1">
              <p className="font-medium text-slate-900">Acceso rápido desde tu pantalla de inicio</p>
              <p className="text-sm text-slate-600 mt-1">
                Sin necesidad de abrir el navegador
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border-2"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5 2 10 5 10 5z"
                  fill="currentColor"
                  className="text-slate-700"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1">
              <p className="font-medium text-slate-900">Funciona incluso sin conexión</p>
              <p className="text-sm text-slate-600 mt-1">
                Accede a tus lecciones descargadas offline
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border-2"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l22 22M23 23l-22-22" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 rounded-full"
          >
            Ahora no
          </Button>
          <Button
            onClick={handleInstall}
            className="flex-1 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            Instalar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
