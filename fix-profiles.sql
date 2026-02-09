-- Añadir columna user_id a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;

-- Crear la foreign key hacia auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Si hay registros con id pero sin user_id, copiar el valor
UPDATE profiles
SET user_id = id
WHERE user_id IS NULL;
