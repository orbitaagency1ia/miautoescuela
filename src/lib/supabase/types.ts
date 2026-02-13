/**
 * Supabase Type Utilities
 * Utilidades de tipo para operaciones de Supabase
 */

import type { Database } from '@/types/database';

// Helper para obtener el tipo de fila de una tabla
type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Helper para el resultado de una query
export type QueryResult<T extends TableName> = {
  data: TableRow<T> | null;
  error: any;
};

export type QueryResultMany<T extends TableName> = {
  data: TableRow<T>[] | null;
  error: any;
};

// Helper para operaciones de Supabase con tipos
export interface SupabaseQueryBuilder<T extends TableName> {
  select(columns?: string): any;
  from(table: T): any;
  eq(column: string, value: any): any;
  neq(column: string, value: any): any;
  gt(column: string, value: any): any;
  gte(column: string, value: any): any;
  lt(column: string, value: any): any;
  lte(column: string, value: any): any;
  like(column: string, value: any): any;
  ilike(column: string, value: any): any;
  in(column: string, values: any[]): any;
  is(column: string, value: any): any;
  order(column: string, options?: { ascending: boolean }): any;
  limit(count: number): any;
  offset(count: number): any;
  single(): any;
  maybeSingle(): any;
  insert(values: TableInsert<T> | TableInsert<T>[]): any;
  update(values: TableUpdate<T>): any;
  delete(): any;
}
