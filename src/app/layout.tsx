import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://miautoescuela.com'),
  title: {
    default: 'mIAutoescuela - Plataforma LMS para Autoescuelas | Software de Gestión',
    template: '%s | mIAutoescuela'
  },
  description: 'Software de gestión para autoescuelas. Gestiona alumnos, contenidos multimedia, seguimiento de progreso y gamificación en una sola plataforma. Prueba gratis 14 días.',
  keywords: [
    'software autoescuela',
    'plataforma LMS autoescuela',
    'gestión alumnos autoescuela',
    'sistema autoescuela online',
    'plataforma educativa conducción',
    'LMS autoescuela España',
    'software gestión autoescuela',
    'plataforma enseñanza conducción'
  ],
  authors: [{ name: 'mIAutoescuela' }],
  creator: 'mIAutoescuela',
  publisher: 'mIAutoescuela',

  // OpenGraph / Facebook
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://miautoescuela.com',
    title: 'mIAutoescuela - Software de Gestión para Autoescuelas',
    description: 'La plataforma todo en uno para autoescuelas modernas. Gestiona alumnos, contenidos, seguimiento y gamificación.',
    siteName: 'mIAutoescuela',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'mIAutoescuela - Plataforma para Autoescuelas'
      }
    ]
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'mIAutoescuela - Software para Autoescuelas',
    description: 'Gestiona tu autoescuela con la plataforma todo en uno. Prueba gratis 14 días.',
    images: ['/og-image.png']
  },

  // Canonical URL
  alternates: {
    canonical: 'https://miautoescuela.com'
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // App links
  appleWebApp: {
    capable: true,
    title: 'mIAutoescuela',
    statusBarStyle: 'default',
  },

  // Additional metadata
  category: 'Education',
  classification: 'Educational Software',
};

// Structured Data (JSON-LD)
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'mIAutoescuela',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Prueba gratis 14 días. Sin tarjeta de crédito.'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '523',
    bestRating: '5',
    worstRating: '1'
  },
  description: 'Plataforma de gestión LMS para autoescuelas. Gestión de alumnos, contenidos multimedia, seguimiento de progreso y sistema de gamificación.',
  author: {
    '@type': 'Organization',
    name: 'mIAutoescuela',
    url: 'https://miautoescuela.com'
  },
  featureList: [
    'Gestión de alumnos',
    'Contenidos multimedia',
    'Seguimiento de progreso',
    'Sistema de gamificación',
    'Foro integrado',
    'Analíticas y reportes',
    'Exámenes personalizados',
    'Multi-tenant por autoescuela'
  ]
};

// Organization Structured Data
const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'mIAutoescuela',
  url: 'https://miautoescuela.com',
  logo: 'https://miautoescuela.com/logo.png',
  description: 'Plataforma LMS premium para autoescuelas modernas',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'contacto@miautoescuela.com',
    availableLanguage: 'Spanish'
  }
};

// LocalBusiness Structured Data
const localBusinessData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'mIAutoescuela',
  url: 'https://miautoescuela.com',
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '523'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessData),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
