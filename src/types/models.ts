/**
 * Business Models
 * Modelos de negocio de la aplicación
 */

import type { Database } from './database';

export type School = Database['public']['Tables']['schools']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SchoolMember = Database['public']['Tables']['school_members']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type ActivityEvent = Database['public']['Tables']['activity_events']['Row'];


// Join types
export type SchoolMemberWithProfile = SchoolMember & {
  profile: Profile;
  school: School;
};

export type LessonWithProgress = Lesson & {
  progress?: LessonProgress | null;
};

export type ModuleWithLessons = Module & {
  lessons: LessonWithProgress[];
};

export type PostWithAuthor = Post & {
  author: Profile;
  _count?: {
    comments: number;
  };
};

export type CommentWithAuthor = Comment & {
  author: Profile;
};

export type LeaderboardEntry = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  lessons_completed: number;
  posts_created: number;
  rank?: number;
  is_current_user?: boolean;
};

// Context types
export interface SchoolContext {
  schoolId: string | null;
  school: School | null;
  role: 'admin' | 'owner' | 'student' | null;
  user: Profile | null;
  isLoading: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface InviteStudentFormData {
  email: string;
  message?: string;
}

export interface ModuleFormData {
  title: string;
  description?: string;
}

export interface LessonFormData {
  title: string;
  description?: string;
  video?: File;
}

export interface PostFormData {
  title: string;
  body: string;
}

export interface CommentFormData {
  body: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
