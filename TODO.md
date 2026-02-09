# TODO - mIAutoescuela

## 🚀 Tareas Prioritarias

### Funcionalidades Críticas
- [ ] **Sistema de Quiz/Exámenes**
  - [ ] Crear tabla `quizzes` en la base de datos
  - [ ] Crear tabla `quiz_questions` y `quiz_options`
  - [ ] Interfaz para crear quizzes en el panel de owner
  - [ ] Interfaz para que estudiantes respondan
  - [ ] Sistema de calificación automática
  - [ ] Mostrar nota en el dashboard del estudiante

- [ ] **Sistema de Certificados**
  - [ ] Generar certificado al completar todos los temas
  - [ ] Diseño del certificado PDF con logo de la autoescuela
  - [ ] Descarga del certificado en PDF
  - [ ] Mostrar certificados en el perfil

- [ ] **Sistema de Notificaciones**
  - [ ] Notificaciones de nuevos temas/lecciones
  - [ ] Notificaciones de foro (respuestas)
  - [ ] Notificaciones de logros alcanzados
  - [ ] Email notifications (usando Resend o similar)

## 🎮 Gamificación (Mejoras)

### Logros e Insignias
- [ ] Tabla `achievements` con tipos de logros
  - [ ] Primera lección completada
  - [ ] 10 lecciones completadas
  - [ ] Todas las lecciones de un tema
  - [ ] Perfect score en quiz
  - [ ] Participación activa en foro
- [ ] Badges visibles en perfil
- [ ] Animación al desbloquear logro

### Niveles Más Detallados
- [ ] Principiante (0-100 puntos)
- [ ] Intermedio (100-500 puntos)
- [ ] Avanzado (500-1000 puntos)
- [ ] Experto (1000+ puntos)
- [ ] Mostrar progreso hacia siguiente nivel

## 📱 Mejoras de UX

### Búsqueda y Filtrado
- [ ] Buscador de contenido en /cursos
- [ ] Filtrar lecciones por estado (completadas, pendientes)
- [ ] Buscador en foro
- [ ] Filtro de alumnos por progreso

### Interfaz Mejorada
- [ ] Skeleton screens durante carga
- [ ] Empty states más elaborados con ilustraciones
  - [ ] Sin lecciones pendientes
  - [ ] Foro vacío
  - [ ] Ranking sin actividad
- [ ] Optimistic updates para acciones rápidas
- [ ] Toast notifications para feedback de acciones

### Modo Oscuro
- [ ] Implementar dark mode toggle
- [ ] Persistir preferencia en perfil
- [ ] Ajustar colores del tema Apple para dark

## 🔧 Mejoras Técnicas

### Performance
- [ ] React Query o SWR para cache de datos
- [ ] Next.js Image optimization para todas las imágenes
- [ ] Infinite scroll para listas largas
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting agresivo

### Testing
- [ ] Unit tests con Jest
- [ ] E2E tests con Playwright
- [ ] Component tests con Testing Library
- [ ] Coverage mínimo 80%

### Calidad de Código
- [ ] ESLint estricto sin warnings
- [ ] Prettier para formateo consistente
- [ ] Husky pre-commit hooks
- [ ] Github Actions para CI/CD

## 📊 Dashboard Propietario (Mejoras)

### Estadísticas Avanzadas
- [ ] Gráfico de progreso de estudiantes
- [ ] Tasa de finalización de cursos
- [ ] Estadísticas de uso del foro
- [ ] Tiempo medio dedicado por estudiante
- [ ] Exportar reportes a CSV/PDF

### Gestión de Contenido
- [ ] Editor de lecciones mejorado
  - [ ] Vista previa de video
  - [ ] Subir múltiples videos a la vez
  - [ ] Reordenar lecciones con drag & drop
- [ ] Duplicar temas/lecciones
- [ ] Importar/exportar contenido

## 👥 Área Social

### Foro Mejorado
- [ ] Hilos en el foro (comentarios anidados)
- [ ] Marcar post como favorito
- [ ] Seguir posts de otros usuarios
- [ ] Menciones a usuarios (@usuario)
- [ ] Búsqueda avanzada en foro
- [ ] Categorías/etiquetas en posts

### Comunidad
- [ ] Perfiles públicos de estudiantes
- [ ] Tabla de líderes visible
- [ ] Desafíos entre estudiantes
- [ ] Chat grupal para temas específicos

## 💰 Negocio y Monetización

### Planes y Precios
- [ ] Sistema de planes múltiples
- [ ] Límite de estudiantes por plan
- [ ] Trial automático de 14 días
- [ ] Upgrade/downgrade de planes

### Integraciones
- [ ] Stripe para pagos recurrentes
- [ ] Webhooks para eventos de pago
- [ ] Emails de transacciones
- [ ] Facturación automática

## 🌐 Internacionalización

### Multi-idioma
- [ ] Sistema de traducción (next-intl)
- [ ] Inglés, Francés, Alemán
- [ ] Selector de idioma en perfil
- [ ] Contenido traducible

## 📱 Móvil

### Responsive Mejorado
- [ ] App móvil híbrida (React Native o Capacitor)
- [ ] Push notifications
- [ ] Descarga offline de videos
- [ ] Modooffline para estudiar sin internet

---

## 🎯 Orden Sugerido de Implementación

### Fase 1: Fundamentales (1-2 meses)
1. Sistema de Quiz/Exámenes
2. Certificados
3. Skeleton + Toast notifications

### Fase 2: Gamificación (1 mes)
4. Logros e insignias
5. Niveles mejorados
6. Ranking por temas

### Fase 3: UX Avanzada (2 semanas)
7. Búsqueda y filtros
8. Optimistic updates
9. Dark mode

### Fase 4: Social (1 mes)
10. Foro mejorado
11. Perfiles públicos
12. Desafíos

### Fase 5: Negocio (2 semanas)
13. Planes múltiples
14. Límites por plan
15. Facturación

### Fase 6: Técnica (continuo)
16. Testing
17. Performance
18. CI/CD

---

## 📝 Notas de Desarrollo

### Antes de empezar una tarea
1. Leer `PROYECTOdocs.md` para entender el sistema de diseño
2. NO usar componentes `Card` - usar `div` con clases personalizadas
3. Seguir el patrón Apple: sombras suaves, sin bordes
4. Testear en móvil desktop responsive

### Al crear nuevos componentes
1. Usar Tailwind classes directamente
2. Evitar componentes shadcn/ui que usen borders
3. Aplicar `transition-all duration-200`
4. Añadir hover states apropiados

### Code Review Checklist
- [ ] No usa `Card` components
- [ ] Usa `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`
- [ ] Usa `rounded-2xl` para cards
- [ ] Usa `duration-200` para transiciones
- [ ] Tiene hover states apropiados
- [ ] Funciona en móvil

---

**Última revisión:** Febrero 2025
**Estado:** Activo y en desarrollo
