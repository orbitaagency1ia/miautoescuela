'use client';

import { Globe } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>mIAutoescuela</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://www.orbitaagency.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <span className="text-muted-foreground">Desarrollado por</span>
              <Image
                src="/orbita-logo.png"
                alt="OrbitaAgency"
                width={20}
                height={20}
                className="rounded-full brightness-0"
              />
              <span className="font-medium">OrbitaAgency</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
