-- Extensions y funciones auxiliares compartidas

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

