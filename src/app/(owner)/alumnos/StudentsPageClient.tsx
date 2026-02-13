'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CSVImportDialog } from '@/components/owner/CSVImportDialog';

interface StudentsPageClientProps {
  primaryColor: string;
  secondaryColor: string;
  children: React.ReactNode;
}

export function StudentsPageClient({ primaryColor, secondaryColor, children }: StudentsPageClientProps) {
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const router = useRouter();

  const handleImportComplete = (count: number) => {
    setTimeout(() => {
      setShowCSVDialog(false);
      router.refresh();
    }, 1500);
  };

  return (
    <>
      {/* Add CSV Import button to header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowCSVDialog(true)}
          className="rounded-full border-2"
        >
          <Upload className="mr-2 h-5 w-5" />
          Importar CSV
        </Button>

        <Link href="/alumnos/invitar">
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Invitar Alumno
          </Button>
        </Link>
      </div>

      <CSVImportDialog
        open={showCSVDialog}
        onOpenChange={setShowCSVDialog}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onImportComplete={handleImportComplete}
      />

      {children}
    </>
  );
}
