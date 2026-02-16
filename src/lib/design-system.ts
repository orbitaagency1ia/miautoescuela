// Apple Premium Design System - Estándares de Diseño
// Basado en Apple Human Interface Guidelines

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  xs: 'rounded-lg',      // 8px
  sm: 'rounded-xl',      // 12px
  md: 'rounded-2xl',     // 16px
  lg: 'rounded-3xl',     // 24px
  full: 'rounded-full',  // pill
} as const;

// ============================================
// SPACING
// ============================================
export const spacing = {
  xs: 'p-3',      // 12px
  sm: 'p-4',      // 16px
  md: 'p-6',      // 24px
  lg: 'p-8',      // 32px
  xl: 'p-10',     // 40px
} as const;

// ============================================
// SHADOWS
// ============================================
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
} as const;

// ============================================
// BORDERS
// ============================================
export const borders = {
  none: 'border-0',
  thin: 'border border-slate-200',
  default: 'border-2 border-slate-200',
  thick: 'border-2 border-slate-900',
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  h1: 'text-4xl md:text-5xl font-semibold tracking-tight text-slate-900',
  h2: 'text-2xl md:text-3xl font-semibold tracking-tight text-slate-900',
  h3: 'text-xl font-semibold text-slate-900',
  h4: 'text-lg font-semibold text-slate-900',
  body: 'text-sm text-slate-600',
  label: 'text-sm font-semibold text-slate-700',
  small: 'text-xs text-slate-500',
} as const;

// ============================================
// BUTTONS
// ============================================
export const buttons = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md',
  secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md',
  ghost: 'hover:bg-slate-100 text-slate-600',
  sizing: 'h-12 px-6 rounded-full font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
  icon: 'h-9 w-9 p-0 rounded-xl',
} as const;

// ============================================
// INPUTS
// ============================================
export const inputs = {
  base: 'h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400',
  withIcon: 'pl-12 h-12 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400',
} as const;

// ============================================
// CARDS
// ============================================
export const cards = {
  primary: 'bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-2 border-slate-100',
  secondary: 'bg-white rounded-2xl shadow-lg border-2 border-slate-100',
  hover: 'hover:shadow-lg hover:border-slate-200 transition-all duration-300',
} as const;

// ============================================
// TABLES
// ============================================
export const tables = {
  container: 'bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-2 border-slate-100 overflow-hidden',
  header: 'bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200',
  headerCell: 'py-3 px-4 text-left font-bold text-slate-700 text-xs uppercase tracking-wider',
  row: 'border-b border-slate-100 hover:bg-blue-50/50 hover:border-blue-100/50 transition-all duration-200',
  cell: 'py-4 px-4',
} as const;

// ============================================
// STATUS BADGES
// ============================================
export const badges = {
  active: 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200',
  trial: 'bg-blue-50 text-blue-700 border-2 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-2 border-amber-200',
  error: 'bg-red-50 text-red-700 border-2 border-red-200',
  default: 'bg-slate-50 text-slate-600 border-2 border-slate-200',
  sizing: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
} as const;

// ============================================
// GRADIENTS
// ============================================
export const gradients = {
  primary: 'from-blue-500 to-indigo-600',
  success: 'from-emerald-500 to-green-600',
  danger: 'from-red-500 to-rose-600',
  warning: 'from-amber-500 to-orange-600',
  info: 'from-blue-500 to-cyan-600',
  surface: 'from-blue-50 via-indigo-50 to-violet-50',
} as const;

// ============================================
// ICON CONTAINERS
// ============================================
export const iconContainers = {
  sm: 'p-2 rounded-lg bg-slate-100',
  md: 'p-3 rounded-2xl bg-slate-100',
  lg: 'p-4 rounded-2xl',
  gradient: 'p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25',
} as const;

// ============================================
// COLORS (para estilos inline)
// ============================================
export const colors = {
  blue: { bg: '#EFF6FF', text: '#2563EB' },
  emerald: { bg: '#ECFDF5', text: '#059669' },
  violet: { bg: '#F5F3FF', text: '#7C3AED' },
  amber: { bg: '#FFFBEB', text: '#D97706' },
  red: { bg: '#FEF2F2', text: '#DC2626' },
  slate: { bg: '#F8FAFC', text: '#64748B' },
} as const;
