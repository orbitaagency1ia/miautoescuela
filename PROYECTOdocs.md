# mIAutoescuela - Documentación del Proyecto

## 📋 Resumen del Proyecto

** Plataforma SaaS multi-tenant para autoescuelas en España**
- Tecnología: Next.js 16.1.6 (App Router), Supabase (PostgreSQL + Auth + Storage), TypeScript
- Diseño: Estilo premium Apple (sin bordes, sombras suaves, animaciones fluidas)

---

## 🎨 Sistema de Diseño Apple Implementado

### Colores Principales
- Azul primario: `#3B82F6`
- Grises neutrales: `#6B7280`, `#9CA3AF`, `#D1D5DB`
- Fondo principal: `#F8F9FB` (no blanco puro)
- Fondo cards: `#FFFFFF`

### Sombras
- Default: `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`
- Hover: `shadow-[0_8px_24px_rgba(0,0,0,0.1)]`
- Sidebar: `1px 0 0 rgba(0,0,0,0.04)` (solo sombra, sin border)

### Bordes y Redondeos
- **SIN BORDES** en cards (regla #1)
- Cards: `rounded-2xl` (16px)
- Botones/inputs: `rounded-xl` (12px)
- Badges: `rounded-full`

### Transiciones
- Duración: `duration-200` (snappy, no lento)
- Propiedades: `transition-all`

### Efectos Hover
- Elevación: `hover:-translate-y-0.5`
- Escala: `hover:scale-105` (botones prominentes)

---

## 📁 Estructura de Archivos Importantes

```
src/
├── app/
│   ├── (auth)/
│   │   ├── iniciar-sesion/page.tsx
│   │   └── registrarse/page.tsx
│   ├── (student)/
│   │   ├── layout.tsx                    # Layout estudiantes con sidebar
│   │   ├── inicio/page.tsx               # Dashboard estudiante
│   │   ├── cursos/page.tsx              # Lista de temas
│   │   ├── cursos/[moduleId]/page.tsx   # Vista de tema
│   │   ├── cursos/[moduleId]/[lessonId]/page.tsx  # Reproductor video
│   │   ├── ranking/page.tsx              # Ranking estudiantes
│   │   ├── foro/page.tsx                # Foro principal
│   │   ├── foro/nuevo/page.tsx          # Nueva publicación
│   │   ├── foro/[id]/page.tsx           # Ver post
│   │   └── ajustes/page.tsx             # Configuración estudiante
│   ├── (owner)/
│   │   ├── layout.tsx                    # Layout propietario
│   │   ├── panel/page.tsx               # Dashboard owner
│   │   ├── temas/page.tsx               # Gestión temas
│   │   ├── temas/crear/page.tsx        # Crear tema
│   │   ├── temas/[moduleId]/page.tsx   # Editar tema
│   │   ├── alumnos/page.tsx             # Lista alumnos
│   │   ├── alumnos/invitar/page.tsx    # Invitar alumnos
│   │   ├── configuracion/page.tsx      # Configuración escuela
│   │   └── suscripcion/page.tsx        # Suscripción
│   └── (admin)/
│       ├── layout.tsx                   # Layout admin
│       ├── admin/page.tsx              # Dashboard admin
│       ├── admin/autoescuelas/page.tsx # Lista autoescuelas
│       ├── admin/autoescuelas/[school]/page.tsx  # Detalle escuela
│       ├── admin/suscripciones/page.tsx  # Gestión suscripciones
│       └── admin/configuracion/page.tsx     # Config admin
├── components/
│   ├── layout/
│   │   ├── StudentSidebar.tsx          # Sidebar estudiantes
│   │   ├── OwnerSidebar.tsx            # Sidebar propietarios
│   │   └── AdminSidebar.tsx            # Sidebar admin
│   ├── student/
│   │   ├── LogoutButton.tsx
│   │   ├── AppleModuleCard.tsx         # Card tema (estilo Apple)
│   │   └── AppleLessonCard.tsx         # Card lección (estilo Apple)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx                    # ⚠️ DEPRECATED - No usar
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   └── utils.ts
├── types/
│   ├── database.ts
│   └── models.ts
└── actions/
    ├── auth.ts
    ├── school.ts
    ├── content.ts
    ├── invites.ts
    └── admin.ts
```

---

## 🔐 Credenciales de Prueba

### Usuario Estudiante
- **Email:** `test1770639200861@prueba.com`
- **Password:** `Test123!`
- **Rol:** Estudiante
- **Escuela:** Test School

### Usuario Admin/Owner
- Necesita crear uno propio o verificar si existe alguno en la base de datos

---

## 🚀 Comandos Útiles

### Desarrollo
```bash
npm run dev          # Iniciar servidor desarrollo
npm run build         # Compilar para producción
```

### Base de Datos
```bash
# Generar tipos de Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.ts
```

---

## ⚠️ Reglas de Diseño (CRÍTICO)

### ❌ NO HACER
1. **NO usar componentes `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`**
   - Usar `<div>` con clases apropiadas en su lugar

2. **NO usar bordes en cards**
   - `border`, `border-2`, `border-b`, `border-top` en cards
   - Usar sombras para separación visual

3. **NO usar `shadow-premium` o `shadow-lg` como default**
   - Usar `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`

4. **NO usar `duration-300` o mayores**
   - Usar `duration-200` para animaciones snappy

5. **NO usar background `#FFFFFF` puro**
   - Usar `#F8F9FB` para fondos principales

### ✅ SÍ HACER
1. Usar `shadow-[0_1px_4px_rgba(0,0,0,0.06)]` para cards
2. Usar `hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]` para hover
3. Usar `hover:-translate-y-0.5` para elevación
4. Usar `transition-all duration-200` para transiciones
5. Usar `rounded-2xl` para cards grandes
6. Usar `rounded-xl` para botones/inputs
7. Añadir badge `Sparkles` en headers de página

### Patrón de Card
```tsx
// ✅ CORRECTO - Apple Style
<div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
  <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl -mt-6 -mx-6 mb-4">
    <h3 className="text-lg font-semibold text-slate-900">Título</h3>
    <p className="text-sm text-slate-500 mt-1">Descripción</p>
  </div>
  <div>Contenido...</div>
</div>

// ❌ INCORRECTO - Card antiguo
<Card className="shadow-premium border-2">
  <CardHeader className="border-b">
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido...</CardContent>
</Card>
```

---

## 🔧 Componentes a Usar/Evitar

### ✅ Usar
- `div` con clases Tailwind personalizadas
- `Button` de `@/components/ui/button`
- `Input`, `Label`, `Badge` de `@/components/ui/*`
- `Link` de `next/link`
- `AppleModuleCard.tsx` y `AppleLessonCard.tsx`

### ❌ Evitar
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `shadow-premium`, `shadow-premium-lg`
- `border-2` en cards (usar solo en tablas si es necesario)
- `duration-300` o superiores (usar `duration-200`)

---

## 📊 Base de Datos - Tablas Principales

### Schools (Autoescuelas)
```sql
- id, name, slug, logo_url
- primary_color, secondary_color
- subscription_status (active, trialing, past_due, canceled, incomplete)
- stripe_customer_id, stripe_subscription_id
- trial_ends_at
```

### School_Members (Miembros)
```sql
- id, school_id, user_id
- role (admin, owner, student)
- status (active, suspended, removed)
- joined_at
```

### Modules (Temas)
```sql
- id, school_id, title, description
- order_index, is_published
```

### Lessons (Clases)
```sql
- id, school_id, module_id, title, description
- video_path, video_duration_seconds, thumbnail_url
- order_index, is_published
```

### Lesson_Progress (Progreso)
```sql
- id, school_id, lesson_id, user_id
- progress_percent, completed_at, last_watched_at
```

### Posts & Comments (Foro)
```sql
- posts: id, school_id, author_id, title, body, is_pinned, is_locked
- comments: id, school_id, post_id, author_id, body
```

### Activity_Events (Puntos)
```sql
- id, school_id, user_id
- event_type (lesson_completed, post_created, comment_created)
- points, reference_id
```

---

## 🎯 Funcionalidades por Área

### Área Estudiante (/inicio, /cursos, /ranking, /foro, /ajustes)
- ✅ Dashboard con estadísticas
- ✅ Lista de temas con progreso
- ✅ Reproductor de video
- ✅ Sistema de puntos (10 por lección completada)
- ✅ Foro con publicaciones y comentarios
- ✅ Ranking de alumnos
- ✅ Perfil editable

### Área Propietario (/panel, /temas, /alumnos, /configuración, /suscripción)
- ✅ Dashboard con estadísticas
- ✅ Crear/editar temas (módulos)
- ✅ Añadir/editar lecciones con video
- ✅ Gestión de alumnos
- ✅ Invitar alumnos con código
- ✅ Configuración de marca (logo, colores, mensaje bienvenida)
- ✅ Gestión de suscripción Stripe

### Área Admin (/admin)
- ✅ Dashboard global con estadísticas
- ✅ Lista de todas las autoescuelas
- ✅ Ver detalle de cada autoescuela
- ✅ Gestión de suscripciones
- ✅ Configuración de plataforma

---

## 🚧 Pendientes / Mejoras Futuras

### Funcionalidades
- [ ] Sistema de quiz/exámenes al final de cada tema
- [ ] Certificados al completar cursos
- [ ] Sistema de notificaciones
- [ ] Chat en tiempo real entre alumnos
- [ ] Gamificación mejorada (logros, niveles, insignias)
- [ ] App móvil (React Native o similar)
- [ ] Zona de práctica con tests tipo examen DGT
- [ ] Estadísticas avanzadas para propietarios

### Mejoras de UX
- [ ] Búsqueda de contenido
- [ ] Filtros avanzados en listas
- [ ] Exportación de datos (CSV, PDF)
- [ ] Modo oscuro (dark mode)
- [ ] Accesibilidad (WCAG AA compliance)
- [ ] Animaciones de entrada más elaboradas
- [ ] Skeleton screens durante carga

### Mejoras Técnicas
- [ ] Optimización de imágenes (Next.js Image)
- [ ] Caching agresivo con SWR o React Query
- [ ] Server Actions para mutaciones
- [ ] Streaming para listas largas
- [ ] Tests automatizados (Jest, Playwright)
- [ ] CI/CD pipeline
- [ ] Error boundaries mejorados

---

## 🐛 Problemas Conocidos y Soluciones

### Error: "LogOut is not defined"
- **Solución:** Usar `LogoutButton` component en vez de importar `LogOut` directamente

### Error: Event handlers cannot be passed to Client Component
- **Solución:** Convertir página a `'use client'` component

### Error: "multiple instances of next dev running"
- **Solución:** `pkill -9 node` y `rm -rf .next/dev/lock`

### Error: useEffect dependency warning
- **Solución:** Remover `router` de dependencias, añadir `// eslint-disable-next-line react-hooks/exhaustive-deps`

### Turbopack panic / cache corruption
- **Solución:** `rm -rf .next` y reiniciar servidor

---

## 📦 Scripts Nuevos que Faltan

### Para Testing
```json
"test": "jest",
"test:e2e": "playwright test",
"lint": "next lint"
```

### Para Utilidades
```json
"db:types": "npx supabase gen types typescript --project-id XXX --schema public > src/types/database.ts",
"db:seed": "ts-node scripts/seed.ts",
"db:migrate": "supabase db push"
```

---

## 🎨 Referencias de Diseño

### Páginas de Referencia del Diseño Apple
- Inicio: `/inicio` - Dashboard con stat cards
- Cursos: `/cursos` - Grid de temas con AppleModuleCard
- Foro: `/foro` - Lista de posts con cards sin bordes

### Colores por Categoría
- **Azul:** Primario, botones principales, links activos
- **Verde:** Éxito, completado, crecimiento
- **Púrpura/Violeta:** Progreso, contenido premium
- **Naranja/Ambar:** Puntos, logros, alertas
- **Rojo:** Cerrar sesión, acciones destructivas
- **Grises:** Texto secundario, placeholders

---

## 🔗 Links Útiles

- **Supabase:** https://supabase.com
- **Next.js:** https://nextjs.org/docs
- **Tailwind:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev
- **Date-fns:** https://date-fns.org

---

## 📝 Notas de Desarrollo

### Al crear nuevas páginas
1. Usar `div` en lugar de `Card`
2. Aplicar siempre `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`
3. Añadir `transition-all duration-200` a elementos interactivos
4. Usar `rounded-2xl` para cards grandes
5. Añadir badge `Sparkles` en el header
6. Fondo principal debe ser `#F8F9FB`

### Al actualizar componentes existentes
1. Buscar reemplazos de `Card` → `div`
2. Eliminar `border-2`, `border-b`, `border-top` de cards
3. Cambiar `shadow-premium` → `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`
4. Cambiar `duration-300` → `duration-200`
5. Añadir hover effects

---

## 🚀 Despliegue

### Variables de Entorno Necesarias
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Build para Producción
```bash
npm run build
npm start
```

### Hosting Recomendado
- Vercel (recomendado para Next.js)
- Railway
- Supabase Hosting

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar este documento
2. Verificar que no estés usando componentes `Card` deprecated
3. Limpiar caché: `rm -rf .next`
4. Reiniciar servidor: `npm run dev`

---

**Última actualización:** Febrero 2025
**Versión:** 1.0.0
**Estado:** Activo
