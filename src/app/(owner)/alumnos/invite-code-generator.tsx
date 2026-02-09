'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Copy, Check, Sparkles, Link2, Calendar, X } from 'lucide-react';

interface InviteCodeGeneratorProps {
  primaryColor: string;
  secondaryColor: string;
}

export function InviteCodeGenerator({ primaryColor, secondaryColor }: InviteCodeGeneratorProps) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools/generate-code', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar código');
      }

      setCode(data.code);
      setExpiresAt(data.expiresAt);
      setShareableLink(data.shareableLink);
    } catch (error: any) {
      console.error('Error generating code:', error);
      alert(error.message || 'Error al generar código');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (code) {
    return (
      <Card className="border-2 shadow-premium overflow-hidden">
        <CardHeader
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b"
          style={{
            borderColor: `${primaryColor}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Check className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              Código Generado Exitosamente
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCode(null);
                setExpiresAt(null);
                setShareableLink(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Code Display */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Código de Invitación
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 p-4 rounded-xl border-2 bg-slate-50 font-mono text-center text-2xl font-bold tracking-wider"
                style={{
                  borderColor: `${primaryColor}30`,
                  color: primaryColor,
                }}
              >
                {code}
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                size="lg"
                className="shrink-0 rounded-xl border-2 hover:bg-slate-50"
                style={{ borderColor: `${primaryColor}30` }}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5 text-emerald-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Shareable Link */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Enlace Compartible
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-xl border-2 bg-slate-50 font-mono text-sm truncate">
                {shareableLink}
              </div>
              <Button
                onClick={copyLink}
                variant="outline"
                size="lg"
                className="shrink-0 rounded-xl border-2 hover:bg-slate-50"
                style={{ borderColor: `${primaryColor}30` }}
              >
                {linkCopied ? (
                  <>
                    <Check className="mr-2 h-5 w-5 text-emerald-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-5 w-5" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Expira:{' '}
              {expiresAt
                ? new Date(expiresAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>Comparte este código o enlace</strong> con tus alumnos para que puedan unirse a tu autoescuela.
              El código expira en 7 días.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group relative overflow-hidden border-2 shadow-premium transition-all duration-300 hover:scale-[1.01]"
      style={{
        borderColor: `${primaryColor}30`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}05 0%, ${secondaryColor}05 100%)`,
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Code className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          Generar Código de Invitación
        </CardTitle>
      </CardHeader>
      <CardContent className="relative p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-600 mb-2">
              Genera un código único que puedes compartir con tus alumnos para que se unan a tu autoescuela.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4" />
              <span>Válido por 7 días</span>
            </div>
          </div>
          <Button
            onClick={generateCode}
            disabled={loading}
            size="lg"
            className="shrink-0 rounded-full shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Código
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
