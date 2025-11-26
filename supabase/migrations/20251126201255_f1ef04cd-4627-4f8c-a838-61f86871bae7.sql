-- Add new fields to profiles table for enhanced signup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS hobbies text,
ADD COLUMN IF NOT EXISTS persona text,
ADD COLUMN IF NOT EXISTS organization text,
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS specialization text;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create index for email lookups  
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Add check constraint for username format (alphanumeric, underscore, dash, 3-30 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$');