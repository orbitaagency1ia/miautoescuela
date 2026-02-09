# mIAutoescuela

Una plataforma SaaS multi-tenant para autoescuelas en España, construida con Next.js 16, Supabase, y Stripe.

Created by OrbitaAgency

## Características

- **Multi-tenant**: Múltiples autoescuelas en una sola plataforma con aislamiento de datos
- **Gestión de contenido**: Los propietarios pueden crear temas y subir clases en video
- **Sistema de alumnos**: Invitación por email, registro seguro, y seguimiento de progreso
- **Foro**: Los alumnos pueden compartir dudas y experiencias
- **Ranking**: Gamificación con puntos de actividad
- **Pagos con Stripe**: Suscripción mensual con portal de cliente
- **Trial gratuito**: 14 días de prueba para nuevas autoescuelas

## Stack Tecnológico

- **Frontend**: Next.js 16.1.6 (App Router), React 19
- **Estilos**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Pagos**: Stripe
- **Despliegue**: Vercel (recomendado)

## Configuración Local

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Cuenta de Supabase (https://supabase.com)
- Cuenta de Stripe (opcional, para pagos)

### Instalación

1. Clona el repositorio:
```bash
git clone <repo-url>
cd miautoescuela
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY_ID=price_...
NEXT_PUBLIC_STRIPE_URL=https://dashboard.stripe.com
```

### Configuración de Supabase

1. Crea un proyecto nuevo en Supabase
2. Ejecuta las migraciones SQL en orden:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240102000000_add_rls_policies.sql`
3. Configura el Storage:
   - Crea un bucket llamado `lesson-videos`
   - Hazlo público (para signed URLs)
4. Copia tus credenciales desde Settings > API

### Configuración de Stripe (opcional)

1. Crea una cuenta en Stripe
2. Crea un producto con precio mensual (ej: €49/mes)
3. Copia el Price ID y añádelo a `STRIPE_PRICE_MONTHLY_ID`
4. Configura el webhook en `https://tu-dominio.com/api/stripe/webhook`

### Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Primeros Pasos

1. **Registrar el admin**: La primera vez que ejecutes la app, registra un usuario
2. **Crear autoescuela**: Accede a `/admin` y crea la primera autoescuela
3. **Configurar Stripe**: Opcional - activa las suscripciones para propietarios
4. **Invitar alumnos**: Los propietarios pueden invitar alumnos desde `/alumnos/invitar`

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (admin)/           # Rutas del admin
│   ├── (owner)/           # Rutas del propietario
│   ├── (student)/         # Rutas del alumno
│   ├── (auth)/            # Rutas de autenticación
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── layout/            # Sidebars, Footer
│   └── stripe/            # Componentes de Stripe
├── lib/
│   ├── supabase/          # Clientes de Supabase
│   ├── constants.ts       # Constantes de la app
│   ├── utils.ts           # Utilidades
│   └── stripe.ts          # Configuración de Stripe
├── actions/               # Server Actions
└── types/                 # Tipos TypeScript
```

## Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Añade las variables de entorno
3. Despliega

### Webhooks de Stripe

Después del despliegue, configura el webhook de Stripe:
```
https://tu-dominio.com/api/stripe/webhook
```

Eventos necesarios:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Soporte

Para issues o preguntas, contacta a OrbitaAgency.

## Licencia

Proprietary - Todos los derechos reservados.
