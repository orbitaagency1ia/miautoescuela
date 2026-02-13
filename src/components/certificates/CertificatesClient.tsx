'use client';

import { useState } from 'react';
import { Award, Download, Check, Calendar, Building2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  issued_at: string;
  pdf_url?: string;
  schools: {
    name: string;
    logo_url?: string;
  };
  modules?: {
    title: string;
  };
}

interface CertificatesClientProps {
  certificates: Certificate[];
  primaryColor: string;
  secondaryColor: string;
}

export function CertificatesClient({ certificates, primaryColor, secondaryColor }: CertificatesClientProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadCertificate = async (certId: string) => {
    setDownloadingId(certId);
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: certId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado_${certId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo descargar el certificado',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el certificado',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8 border border-amber-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Award className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Mis Certificados
            </h1>
            <p className="text-slate-600">
              {certificates.length} {certificates.length === 1 ? 'certificado obtenido' : 'certificados obtenidos'}
            </p>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-16 text-center">
            <div className="p-6 rounded-3xl inline-flex mb-6 bg-gradient-to-br from-amber-100 to-orange-100">
              <Award className="h-16 w-16 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes certificados aún</h3>
            <p className="text-slate-500">
              Completa todos los lessons de un módulo para obtener tu certificado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              isDownloading={downloadingId === cert.id}
              onDownload={() => downloadCertificate(cert.id)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CertificateCardProps {
  certificate: Certificate;
  isDownloading: boolean;
  onDownload: () => void;
  primaryColor: string;
  secondaryColor: string;
}

function CertificateCard({ certificate, isDownloading, onDownload, primaryColor }: CertificateCardProps) {
  const completionDate = new Date(certificate.completion_date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="group relative overflow-hidden rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Certificate Preview - Stylized */}
      <div className="relative border-8 border-double border-amber-200 bg-white m-4 p-6 text-center">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 inline-block mb-4">
          <Award className="h-12 w-12 text-amber-600" />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Certificado de</p>
            <h3 className="text-xl font-bold text-slate-900">
              {certificate.modules?.title || certificate.course_name}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Building2 className="h-4 w-4" />
            <span>{certificate.schools?.name}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{completionDate}</span>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-400">Nº {certificate.certificate_number}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative p-4 pt-0">
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full rounded-full"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, 0%, ${primaryColor} 100%)`,
          }}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Descargar Certificado
            </>
          )}
        </Button>

        {certificate.pdf_url && (
          <a
            href={certificate.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Ver en navegador
          </a>
        )}
      </div>
    </Card>
  );
}
