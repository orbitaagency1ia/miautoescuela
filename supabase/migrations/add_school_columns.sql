-- ============================================
-- Añadir columnas faltantes a la tabla schools
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================

-- Añadir banner_url si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE schools ADD COLUMN banner_url TEXT;
  END IF;
END $$;

-- Añadir welcome_message si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'welcome_message'
  ) THEN
    ALTER TABLE schools ADD COLUMN welcome_message TEXT;
  END IF;
END $$;

-- Añadir address si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'address'
  ) THEN
    ALTER TABLE schools ADD COLUMN address TEXT;
  END IF;
END $$;

-- Añadir website si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'website'
  ) THEN
    ALTER TABLE schools ADD COLUMN website TEXT;
  END IF;
END $$;

-- Verificar las columnas añadidas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'schools'
  AND column_name IN ('banner_url', 'welcome_message', 'address', 'website')
ORDER BY column_name;
