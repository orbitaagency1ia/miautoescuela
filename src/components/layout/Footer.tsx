import { Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>mIAutoescuela</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Created by OrbitaAgency
          </p>
        </div>
      </div>
    </footer>
  );
}
