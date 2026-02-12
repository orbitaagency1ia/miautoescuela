-- =====================================================
-- DEMO DATA FOR MIAUTOESCUELA ADMIN
-- =====================================================
-- This migration inserts demo data for testing the admin panel
-- Run this manually or add to your migrations

-- First, let's create some demo users and profiles
-- Note: In production, these would be created through actual auth/signup

-- =====================================================
-- 1. CREATE DEMO SCHOOLS
-- =====================================================
INSERT INTO schools (id, name, slug, contact_email, phone, address, website, primary_color, secondary_color, subscription_status, trial_ends_at, created_at)
VALUES
  ('school-demo-1', 'Autoescuela Madrid Centro', 'madrid-centro', 'info@madridcentro.com', '+34 910 123 456', 'Calle Gran Vía, 45, Madrid', 'https://madridcentro.com', '#3B82F6', '#1E40AF', 'active', NOW() + INTERVAL '14 days', NOW() - INTERVAL '60 days'),
  ('school-demo-2', 'Autoescuela Barcelona', 'barcelona', 'contacto@autoescuelabcn.com', '+34 933 456 789', 'Avinguda Diagonal, 123, Barcelona', 'https://autoescuelabcn.com', '#8B5CF6', '#6D28D9', 'trialing', NOW() + INTERVAL '7 days', NOW() - INTERVAL '30 days'),
  ('school-demo-3', 'Autoescuela Valencia', 'valencia', 'info@valenciadriving.com', '+34 963 789 012', 'Calle Colón, 78, Valencia', 'https://valenciadriving.com', '#10B981', '#059669', 'active', NOW() + INTERVAL '14 days', NOW() - INTERVAL '90 days'),
  ('school-demo-4', 'Autoescuela Sevilla', 'sevilla', 'sevilla@drivingschool.es', '+34 954 321 098', 'Avenida de la Constitución, 15, Sevilla', 'https://sevilladriving.com', '#F59E0B', '#D97706', 'active', NOW() + INTERVAL '14 days', NOW() - INTERVAL '45 days'),
  ('school-demo-5', 'Autoescuela Bilbao', 'bilbao', 'bilbao@driving.es', '+34 944 567 890', 'Gran Vía de Don Diego López de Haro, 32, Bilbao', 'https://bilbaodriving.com', '#EF4444', '#DC2626', 'past_due', NOW() - INTERVAL '5 days', NOW() - INTERVAL '120 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE DEMO PROFILES (for demo users)
-- =====================================================
-- These profiles are for demo purposes - in production they come from auth
INSERT INTO profiles (id, full_name, email, phone, created_at)
VALUES
  ('profile-student-1', 'María García López', 'maria.garcia@example.com', '+34 611 111 111', NOW() - INTERVAL '30 days'),
  ('profile-student-2', 'Carlos Rodríguez Martínez', 'carlos.rodriguez@example.com', '+34 622 222 222', NOW() - INTERVAL '25 days'),
  ('profile-student-3', 'Ana Fernández Sánchez', 'ana.fernandez@example.com', '+34 633 333 333', NOW() - INTERVAL '20 days'),
  ('profile-student-4', 'Pedro Jiménez Castro', 'pedro.jimenez@example.com', '+34 644 444 444', NOW() - INTERVAL '15 days'),
  ('profile-student-5', 'Laura Morales Ruiz', 'laura.morales@example.com', '+34 655 555 555', NOW() - INTERVAL '10 days'),
  ('profile-student-6', 'Miguel Ángel Torres', 'miguel.torres@example.com', '+34 666 666 666', NOW() - INTERVAL '8 days'),
  ('profile-student-7', 'Carmen Romero Gil', 'carmen.romero@example.com', '+34 677 777 777', NOW() - INTERVAL '5 days'),
  ('profile-student-8', 'José Luis Navas', 'jose.navas@example.com', '+34 688 888 888', NOW() - INTERVAL '3 days'),
  ('profile-student-9', 'Isabel Herrera Moreno', 'isabel.herrera@example.com', '+34 699 999 999', NOW() - INTERVAL '1 day'),
  ('profile-student-10', 'Francisco Javier Paredes', 'francisco.paredes@example.com', '+34 600 000 001', NOW() - INTERVAL '40 days'),
  ('profile-student-11', 'Lucía Díaz Costa', 'lucia.diaz@example.com', '+34 600 000 002', NOW() - INTERVAL '35 days'),
  ('profile-student-12', 'Roberto Blanco Iglesias', 'roberto.blanco@example.com', '+34 600 000 003', NOW() - INTERVAL '28 days'),
  ('profile-student-13', 'Elena Núñez Vargas', 'elena.nunez@example.com', '+34 600 000 004', NOW() - INTERVAL '22 days'),
  ('profile-student-14', 'Diego Ramos Soto', 'diego.ramos@example.com', '+34 600 000 005', NOW() - INTERVAL '18 days'),
  ('profile-student-15', 'Sara Flores Ortiz', 'sara.flores@example.com', '+34 600 000 006', NOW() - INTERVAL '12 days'),
  ('profile-owner-1', 'Juan Pérez (Owner Madrid)', 'juan.madrid@example.com', '+34 600 100 001', NOW() - INTERVAL '90 days'),
  ('profile-owner-2', 'María González (Owner Barcelona)', 'maria.bcn@example.com', '+34 600 100 002', NOW() - INTERVAL '60 days'),
  ('profile-owner-3', 'Luis Herrera (Owner Valencia)', 'luis.valencia@example.com', '+34 600 100 003', NOW() - INTERVAL '100 days'),
  ('profile-owner-4', 'Carmen Ortiz (Owner Sevilla)', 'carmen.sevilla@example.com', '+34 600 100 004', NOW() - INTERVAL '50 days'),
  ('profile-owner-5', 'Pedro Castillo (Owner Bilbao)', 'pedro.bilbao@example.com', '+34 600 100 005', NOW() - INTERVAL '130 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CREATE SCHOOL MEMBERS (students and owners)
-- =====================================================

-- Madrid Centro - 5 students + 1 owner
INSERT INTO school_members (school_id, user_id, role, status, joined_at, created_at)
VALUES
  ('school-demo-1', 'profile-owner-1', 'owner', 'active', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
  ('school-demo-1', 'profile-student-1', 'student', 'active', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('school-demo-1', 'profile-student-2', 'student', 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('school-demo-1', 'profile-student-3', 'student', 'active', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('school-demo-1', 'profile-student-4', 'student', 'suspended', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('school-demo-1', 'profile-student-5', 'student', 'active', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Barcelona - 4 students + 1 owner
INSERT INTO school_members (school_id, user_id, role, status, joined_at, created_at)
VALUES
  ('school-demo-2', 'profile-owner-2', 'owner', 'active', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('school-demo-2', 'profile-student-6', 'student', 'active', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('school-demo-2', 'profile-student-7', 'student', 'active', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('school-demo-2', 'profile-student-8', 'student', 'active', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('school-demo-2', 'profile-student-9', 'student', 'active', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Valencia - 6 students + 1 owner
INSERT INTO school_members (school_id, user_id, role, status, joined_at, created_at)
VALUES
  ('school-demo-3', 'profile-owner-3', 'owner', 'active', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days'),
  ('school-demo-3', 'profile-student-10', 'student', 'active', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
  ('school-demo-3', 'profile-student-11', 'student', 'active', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
  ('school-demo-3', 'profile-student-12', 'student', 'active', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  ('school-demo-3', 'profile-student-13', 'student', 'active', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  ('school-demo-3', 'profile-student-14', 'student', 'suspended', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('school-demo-3', 'profile-student-15', 'student', 'active', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;

-- Sevilla - 2 students + 1 owner
INSERT INTO school_members (school_id, user_id, role, status, joined_at, created_at)
VALUES
  ('school-demo-4', 'profile-owner-4', 'owner', 'active', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  ('school-demo-4', 'profile-student-1', 'student', 'active', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('school-demo-4', 'profile-student-6', 'student', 'active', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Bilbao - 1 student + 1 owner
INSERT INTO school_members (school_id, user_id, role, status, joined_at, created_at)
VALUES
  ('school-demo-5', 'profile-owner-5', 'owner', 'active', NOW() - INTERVAL '130 days', NOW() - INTERVAL '130 days'),
  ('school-demo-5', 'profile-student-2', 'student', 'suspended', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CREATE DEMO MODULES AND LESSONS
-- =====================================================

-- Create demo modules for Madrid school
INSERT INTO modules (id, school_id, title, description, order_index, is_published, created_at)
VALUES
  ('module-1-1', 'school-demo-1', 'Temario 1: El conductor y el vehículo', 'Normas generales y comportamiento cívico', 1, true, NOW() - INTERVAL '60 days'),
  ('module-1-2', 'school-demo-1', 'Temario 2: Señales de circulación', 'Todas las señales que debes conocer', 2, true, NOW() - INTERVAL '55 days'),
  ('module-1-3', 'school-demo-1', 'Temario 3: Velocidad y distancias', 'Límites de velocidad y distancia de seguridad', 3, true, NOW() - INTERVAL '50 days'),
  ('module-1-4', 'school-demo-1', 'Temario 4: Cambios de sentido, dirección y marcha', 'Maniobras básicas', 4, true, NOW() - INTERVAL '45 days'),
  ('module-1-5', 'school-demo-1', 'Temario 5: Adelantamientos', 'Cuándo y cómo adelantar', 5, true, NOW() - INTERVAL '40 days'),
  ('module-1-6', 'school-demo-1', 'Temario 6: Intersecciones y pasos a nivel', 'Prioridad y señalización', 6, false, NOW() - INTERVAL '35 days'),
  ('module-1-7', 'school-demo-1', 'Temario 7: Circulación en ciudad', 'Normas urbanas', 7, true, NOW() - INTERVAL '30 days'),
  ('module-1-8', 'school-demo-1', 'Temario 8: Carreteras convencionales', 'Normas interurbanas', 8, true, NOW() - INTERVAL '25 days'),
  ('module-1-9', 'school-demo-1', 'Temario 9: Autopistas y autovías', 'Circulación en vías rápidas', 9, true, NOW() - INTERVAL '20 days'),
  ('module-1-10', 'school-demo-1', 'Temario 10: Factores de riesgo', 'Distracciones, fatiga y alcohol', 10, true, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Create demo lessons for module 1
INSERT INTO lessons (id, school_id, module_id, title, description, video_path, video_duration_seconds, order_index, is_published, created_at)
VALUES
  ('lesson-1-1', 'school-demo-1', 'module-1-1', 'Clase 1: Introducción al permiso de conducción', 'Conceptos básicos sobre el permiso B', 'https://example.com/video1.mp4', 1200, 1, true, NOW() - INTERVAL '60 days'),
  ('lesson-1-2', 'school-demo-1', 'module-1-1', 'Clase 2: El conductor y su responsabilidad', 'Responsabilidades legales y civiles', 'https://example.com/video2.mp4', 1500, 2, true, NOW() - INTERVAL '58 days'),
  ('lesson-1-3', 'school-demo-1', 'module-1-2', 'Clase 3: Señales de peligro', 'Señales triangulares de advertencia', 'https://example.com/video3.mp4', 1800, 1, true, NOW() - INTERVAL '55 days'),
  ('lesson-1-4', 'school-demo-1', 'module-1-2', 'Clase 4: Señales de reglamentación', 'Señales circulares rojas', 'https://example.com/video4.mp4', 1600, 2, true, NOW() - INTERVAL '53 days'),
  ('lesson-1-5', 'school-demo-1', 'module-1-3', 'Clase 5: Velocidad en zona urbana', 'Límites de 30, 50 y otros casos', 'https://example.com/video5.mp4', 1400, 1, true, NOW() - INTERVAL '50 days'),
  ('lesson-1-6', 'school-demo-1', 'module-1-3', 'Clase 6: Distancias de seguridad', 'Cómo calcular la distancia segura', 'https://example.com/video6.mp4', 1350, 2, true, NOW() - INTERVAL '48 days'),
  ('lesson-1-7', 'school-demo-1', 'module-1-4', 'Clase 7: Cambio de sentido', 'Maniobra de cambio de sentido', 'https://example.com/video7.mp4', 1100, 1, true, NOW() - INTERVAL '45 days'),
  ('lesson-1-8', 'school-demo-1', 'module-1-5', 'Clase 8: Adelantamiento genérico', 'Normas generales de adelantamiento', 'https://example.com/video8.mp4', 1700, 1, true, NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Create modules for Barcelona school
INSERT INTO modules (id, school_id, title, description, order_index, is_published, created_at)
VALUES
  ('module-2-1', 'school-demo-2', 'Temario 1: Conceptos básicos', 'Introducción a la conducción', 1, true, NOW() - INTERVAL '30 days'),
  ('module-2-2', 'school-demo-2', 'Temario 2: Señalización', 'Todas las señales', 2, true, NOW() - INTERVAL '25 days'),
  ('module-2-3', 'school-demo-2', 'Temario 3: Velocidad', 'Control de velocidad', 3, true, NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Create modules for Valencia school
INSERT INTO modules (id, school_id, title, description, order_index, is_published, created_at)
VALUES
  ('module-3-1', 'school-demo-3', 'Temario 1: Permisos y licencias', 'Tipos de permiso', 1, true, NOW() - INTERVAL '90 days'),
  ('module-3-2', 'school-demo-3', 'Temario 2: El vehículo', 'Partes del coche', 2, true, NOW() - INTERVAL '85 days'),
  ('module-3-3', 'school-demo-3', 'Temario 3: Mantenimiento', 'Mantenimiento básico', 3, true, NOW() - INTERVAL '80 days'),
  ('module-3-4', 'school-demo-3', 'Temario 4: Señales verticales', 'Señales en poste', 4, true, NOW() - INTERVAL '75 days'),
  ('module-3-5', 'school-demo-3', 'Temario 5: Marcas viales', 'Pintadas en el suelo', 5, true, NOW() - INTERVAL '70 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREATE LESSON PROGRESS (demo students completing lessons)
-- =====================================================

-- Madrid students progress
INSERT INTO lesson_progress (school_id, user_id, lesson_id, completed_at, created_at)
VALUES
  -- Student 1 (María) - completed 6 lessons, very active
  ('school-demo-1', 'profile-student-1', 'lesson-1-1', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('school-demo-1', 'profile-student-1', 'lesson-1-2', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  ('school-demo-1', 'profile-student-1', 'lesson-1-3', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('school-demo-1', 'profile-student-1', 'lesson-1-5', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('school-demo-1', 'profile-student-1', 'lesson-1-6', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('school-demo-1', 'profile-student-1', 'lesson-1-7', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  -- Student 2 (Carlos) - completed 3 lessons
  ('school-demo-1', 'profile-student-2', 'lesson-1-1', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('school-demo-1', 'profile-student-2', 'lesson-1-2', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('school-demo-1', 'profile-student-2', 'lesson-1-3', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

  -- Student 3 (Ana) - completed 4 lessons
  ('school-demo-1', 'profile-student-3', 'lesson-1-1', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('school-demo-1', 'profile-student-3', 'lesson-1-3', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('school-demo-1', 'profile-student-3', 'lesson-1-4', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('school-demo-1', 'profile-student-3', 'lesson-1-5', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

  -- Student 4 (Pedro) - suspended after 1 lesson
  ('school-demo-1', 'profile-student-4', 'lesson-1-1', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),

  -- Student 5 (Laura) - new, just started
  ('school-demo-1', 'profile-student-5', 'lesson-1-1', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- Barcelona students progress
INSERT INTO lesson_progress (school_id, user_id, lesson_id, completed_at, created_at)
VALUES
  ('school-demo-2', 'profile-student-6', 'lesson-1-1', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('school-demo-2', 'profile-student-7', 'lesson-1-1', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('school-demo-2', 'profile-student-7', 'lesson-1-2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('school-demo-2', 'profile-student-8', 'lesson-1-1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Valencia students progress
INSERT INTO lesson_progress (school_id, user_id, lesson_id, completed_at, created_at)
VALUES
  ('school-demo-3', 'profile-student-10', 'lesson-1-1', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
  ('school-demo-3', 'profile-student-10', 'lesson-1-2', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('school-demo-3', 'profile-student-10', 'lesson-1-5', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('school-demo-3', 'profile-student-11', 'lesson-1-1', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
  ('school-demo-3', 'profile-student-12', 'lesson-1-1', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('school-demo-3', 'profile-student-12', 'lesson-1-3', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('school-demo-3', 'profile-student-13', 'lesson-1-1', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('school-demo-3', 'profile-student-15', 'lesson-1-1', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CREATE SOME DEMO INVITES (pending)
-- =====================================================
INSERT INTO invites (school_id, email, role, accepted, expires_at, created_at)
VALUES
  ('school-demo-1', 'nuevo.estudiante@example.com', 'student', false, NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('school-demo-1', 'admin.invitado@example.com', 'admin', false, NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days'),
  ('school-demo-2', 'estudiante.bcn@example.com', 'student', false, NOW() + INTERVAL '5 days', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (run these to check data)
-- =====================================================
-- SELECT s.name, COUNT(sm.user_id) as total_students,
--   COUNT(CASE WHEN sm.status = 'active' THEN 1 END) as active_students
-- FROM schools s
-- LEFT JOIN school_members sm ON s.id = sm.school_id AND sm.role = 'student'
-- GROUP BY s.id, s.name
-- ORDER BY s.created_at;

-- SELECT p.full_name, sm.role, sm.status, s.name as school
-- FROM school_members sm
-- JOIN profiles p ON sm.user_id = p.id
-- JOIN schools s ON sm.school_id = s.id
-- ORDER BY s.id, sm.role, sm.status;
