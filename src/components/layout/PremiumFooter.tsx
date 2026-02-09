'use client';

import Link from 'next/link';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const footerSections = [
  {
    title: 'Producto',
    links: [
      { name: 'Características', href: '#features' },
      { name: 'Precios', href: '#pricing' },
      { name: 'Para Autoescuelas', href: '#autoescuelas' },
      { name: 'Para Alumnos', href: '#alumnos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { name: 'Sobre Nosotros', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carreras', href: '/careers' },
      { name: 'Prensa', href: '/press' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { name: 'Centro de Ayuda', href: '/help' },
      { name: 'Documentación', href: '/docs' },
      { name: 'Estado del Sistema', href: '/status' },
      { name: 'Contacto', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacidad', href: '/privacy' },
      { name: 'Términos', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Licencias', href: '/licenses' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/miautoescuela' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/miautoescuela' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/miautoescuela' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/miautoescuela' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@miautoescuela' },
];

export function PremiumFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        backgroundColor: '#F8F9FA',
        borderTop: '1px solid #E5E5E5',
      }}
    >
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#000000' }}>
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#000000' }}>
                mIAutoescuela
              </span>
            </Link>
            <p className="text-sm mb-6 max-w-xs" style={{ color: '#666666' }}>
              La plataforma premium para autoescuelas modernas. Transforma la enseñanza de conducción.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-200"
                    style={{ color: '#1A1A1A' }}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4" style={{ color: '#000000' }}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:opacity-60"
                      style={{ color: '#1A1A1A' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div
          className="mt-12 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ borderTopColor: '#E5E5E5' }}
        >
          <a
            href="mailto:contacto@miautoescuela.com"
            className="flex items-center gap-3 text-sm transition-colors hover:opacity-60"
            style={{ color: '#1A1A1A' }}
          >
            <Mail className="h-5 w-5" style={{ color: '#000000' }} />
            contacto@miautoescuela.com
          </a>
          <a
            href="tel:+34900123456"
            className="flex items-center gap-3 text-sm transition-colors hover:opacity-60"
            style={{ color: '#1A1A1A' }}
          >
            <Phone className="h-5 w-5" style={{ color: '#000000' }} />
            +34 900 123 456
          </a>
          <div className="flex items-center gap-3 text-sm" style={{ color: '#1A1A1A' }}>
            <MapPin className="h-5 w-5" style={{ color: '#000000' }} />
            Madrid, España
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t"
        style={{
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#666666' }}>
              © {new Date().getFullYear()} mIAutoescuela. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="transition-colors hover:opacity-60"
                style={{ color: '#1A1A1A' }}
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:opacity-60"
                style={{ color: '#1A1A1A' }}
              >
                Términos
              </Link>
              <Link
                href="/cookies"
                className="transition-colors hover:opacity-60"
                style={{ color: '#1A1A1A' }}
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}
