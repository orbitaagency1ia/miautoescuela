/**
 * Application Constants
 * Constantes de la aplicación
 */

// App info
export const APP_NAME = 'mIAutoescuela';
export const APP_CREATED_BY = 'Created by OrbitaAgency';

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
} as const;

// User roles
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  STUDENT: 'student',
} as const;

// Member status
export const MEMBER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REMOVED: 'removed',
} as const;

// Activity events and points
export const ACTIVITY_EVENTS = {
  LESSON_COMPLETED: 'lesson_completed',
  POST_CREATED: 'post_created',
  COMMENT_CREATED: 'comment_created',
} as const;

export const ACTIVITY_POINTS = {
  LESSON_COMPLETED: 3,
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File uploads
export const MAX_VIDEO_SIZE_MB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '2048', 10);
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Invitation
export const INVITE_TOKEN_EXPIRY_DAYS = parseInt(process.env.INVITE_TOKEN_EXPIRY_DAYS || '7', 10);
export const INVITE_TOKEN_BYTES = 32;

// Completion threshold (percentage)
export const LESSON_COMPLETION_THRESHOLD = 80;

// Leaderboard
export const LEADERBOARD_LIMIT = 10;
export const LEADERBOARD_PERIOD_DAYS = 30;

// Routes
export const ROUTES = {
  // Auth
  LOGIN: '/iniciar-sesion',
  REGISTER: '/registro',
  LOGOUT: '/cerrar-sesion',
  INVITE: '/invitacion',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_SCHOOLS: '/admin/autoescuelas',
  ADMIN_SCHOOL_DETAIL: '/admin/autoescuelas/:id',
  ADMIN_SUBSCRIPTIONS: '/admin/suscripciones',

  // Owner
  OWNER_DASHBOARD: '/panel',
  OWNER_MODULES: '/temas',
  OWNER_MODULE_DETAIL: '/temas/:id',
  OWNER_STUDENTS: '/alumnos',
  OWNER_INVITE: '/alumnos/invitar',
  OWNER_FORUM: '/foro',
  OWNER_POST: '/foro/:id',
  OWNER_LEADERBOARD: '/mejores-alumnos',
  OWNER_SETTINGS: '/configuracion',
  OWNER_SUBSCRIPTION: '/suscripcion',

  // Student
  STUDENT_HOME: '/inicio',
  STUDENT_COURSES: '/clases',
  STUDENT_LESSON: '/clases/:id',
  STUDENT_PROGRESS: '/progreso',
  STUDENT_FORUM: '/foro',
  STUDENT_POST: '/foro/:id',
  STUDENT_LEADERBOARD: '/mejores-alumnos',
  STUDENT_PROFILE: '/perfil',
} as const;

// Stripe (configured later)
export const STRIPE_CONFIG = {
  MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  TRIAL_DAYS: 14,
} as const;

// Toast messages in Spanish
export const TOAST_MESSAGES = {
  // Success
  SUCCESS_SAVED: 'Cambios guardados correctamente',
  SUCCESS_CREATED: 'Creado correctamente',
  SUCCESS_DELETED: 'Eliminado correctamente',
  SUCCESS_INVITED: 'Invitación enviada correctamente',
  SUCCESS_UPDATED: 'Actualizado correctamente',
  SUCCESS_COMPLETED: 'Completado correctamente',

  // Errors
  ERROR_GENERIC: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
  ERROR_NETWORK: 'Error de conexión. Por favor, verifica tu internet.',
  ERROR_UNAUTHORIZED: 'No tienes permiso para realizar esta acción.',
  ERROR_NOT_FOUND: 'Recurso no encontrado.',
  ERROR_INVALID_EMAIL: 'El correo electrónico no es válido.',
  ERROR_REQUIRED_FIELD: 'Este campo es obligatorio.',
  ERROR_PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  ERROR_PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
  ERROR_FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${MAX_VIDEO_SIZE_MB}MB.`,
  ERROR_INVALID_FILE_TYPE: 'Tipo de archivo no válido.',

  // Loading
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  SENDING: 'Enviando...',
  PROCESSING: 'Procesando...',
  UPLOADING: 'Subiendo archivo...',
} as const;
