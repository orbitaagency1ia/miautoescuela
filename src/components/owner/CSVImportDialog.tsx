'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { parseStudentCSV, findDuplicateEmails, StudentRow } from '@/lib/csv-parser';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryColor: string;
  secondaryColor: string;
  onImportComplete?: (count: number) => void;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  primaryColor,
  secondaryColor,
  onImportComplete,
}: CSVImportDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<StudentRow[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: Array<any> } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Formato no válido',
        description: 'Por favor sube un archivo CSV',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseStudentCSV(content);
      setParsedData(result.data);
      setParseErrors(result.errors);
      setFile(file);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    try {
      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedData }),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        if (result.created > 0 && onImportComplete) {
          onImportComplete(result.created);
        }
        toast({
          title: 'Importación completada',
          description: `${result.created} alumnos importados correctamente`,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error al importar',
          description: result.error || 'No se pudo completar la importación',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast({
        title: 'Error al importar',
        description: 'No se pudo completar la importación de alumnos',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setFile(null);
      setParsedData([]);
      setParseErrors([]);
      setImportResult(null);
    }, 300);
  };

  const duplicateEmails = findDuplicateEmails(parsedData);
  const hasValidData = parsedData.length > 0 && parseErrors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Alumnos desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de tus alumnos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Area */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center transition-all',
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500'
              )}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="p-4 rounded-full"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Upload className="h-8 w-8" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      Arrastra tu CSV aquí o click para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Máximo 500 alumnos a la vez
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.length} alumnos válidos
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setParseErrors([]);
                  setImportResult(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File Format Info */}
          {!file && (
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Formato esperado del CSV:</p>
              <code className="text-xs bg-white px-2 py-1 rounded block">
                nombre,email,telefono
              </code>
              <p className="text-xs text-blue-700 mt-2">
                La primera fila debe contener los encabezados. El teléfono es opcional.
              </p>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Vista Previa ({parsedData.length} alumnos)</h4>
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">#</th>
                        <th className="px-3 py-2 text-left font-medium">Nombre</th>
                        <th className="px-3 py-2 text-left font-medium">Email</th>
                        <th className="px-3 py-2 text-left font-medium">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedData.slice(0, 50).map((student, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                          <td className="px-3 py-2">{student.name}</td>
                          <td className="px-3 py-2">{student.email}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {student.phone || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 50 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Mostrando primeros 50 de {parsedData.length} alumnos
                  </p>
                )}
              </div>

              {/* Duplicates Warning */}
              {duplicateEmails.size > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900">Emails duplicados en archivo</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {Array.from(duplicateEmails.entries()).map(([email, rows]) => (
                          <span key={email} className="block">
                            {email} (filas {rows.join(', ')})
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parse Errors */}
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Errores de validación</p>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {parseErrors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">
                            Fila {error.row}: {error.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
              {importResult.created > 0 && (
                <div className="flex items-center gap-2 text-emerald-700 mb-3">
                  <Check className="h-5 w-5" />
                  <p className="font-medium">
                    {importResult.created} alumnos importados correctamente
                  </p>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-red-700">
                    {importResult.errors.length} errores al importar:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        Fila {error.row}: {error.student.email} - {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {importResult ? 'Cerrar' : 'Cancelar'}
          </Button>
          {hasValidData && !importResult && (
            <Button
              onClick={handleImport}
              disabled={isImporting}
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar {parsedData.length} Alumnos
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
