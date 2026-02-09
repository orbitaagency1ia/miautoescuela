'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, ChevronDown, LogIn } from 'lucide-react';

const navLinks = [
  { name: 'Características', href: '#features' },
  { name: 'Precios', href: '#pricing' },
  { name: 'Testimonios', href: '#testimonials' },
];

const solutionsLinks = [
  { name: 'Para Autoescuelas', href: '#autoescuelas', description: 'Gestiona tu escuela' },
  { name: 'Para Alumnos', href: '#alumnos', description: 'Aprende online' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        backgroundColor: '#FFFFFF',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
      className="fixed top-0 left-0 right-0 z-50 py-4"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#000000' }}>
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#000000' }}>
              mIAutoescuela
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-60"
                style={{ color: '#1A1A1A' }}
              >
                {link.name}
              </Link>
            ))}

            {/* Solutions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-60"
                style={{ color: '#1A1A1A' }}
              >
                Soluciones
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </button>

              {isSolutionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56">
                  <div
                    className="rounded-2xl p-2 border"
                    style={{
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    {solutionsLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block px-4 py-3 rounded-xl transition-colors hover:bg-gray-50"
                        style={{ color: '#1A1A1A' }}
                        onClick={() => setIsSolutionsOpen(false)}
                      >
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/iniciar-sesion">
              <Button
                variant="ghost"
                className="font-medium"
                style={{ color: '#1A1A1A' }}
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                className="font-medium rounded-full transition-all duration-300"
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                }}
              >
                Comenzar Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: '#000000' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: '#000000' }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden border-t"
          style={{
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5E5',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            {/* Mobile Nav Links */}
            <nav className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-lg font-medium transition-colors"
                  style={{ color: '#1A1A1A' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Solutions */}
            <div className="space-y-3 pt-4" style={{ borderTopColor: '#E5E5E5' }}>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#666666' }}>
                Soluciones
              </p>
              {solutionsLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block py-2 text-base font-medium transition-colors hover:opacity-60"
                  style={{ color: '#1A1A1A' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  <span className="block text-sm font-normal" style={{ color: '#666666' }}>
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="space-y-3 pt-4" style={{ borderTopColor: '#E5E5E5' }}>
              <Link href="/iniciar-sesion" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="lg"
                  style={{
                    borderColor: '#E5E5E5',
                    color: '#1A1A1A',
                  }}
                >
                  <LogIn className="h-5 w-5" />
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  className="w-full"
                  size="lg"
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                  }}
                >
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
