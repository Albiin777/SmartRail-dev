-- First, explicitly DROP the triggers and functions so no old buggy versions remain
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_update();

-- Recreate the function to handle profile creation safely
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- We wrap the insert in a PL/pgSQL block just for extra safety, 
  -- but the COALESCE handles null metadata
  INSERT INTO public.profiles (id, email, full_name, dob, gender)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'), 
    NULLIF(NEW.raw_user_meta_data->>'dob', '')::date, 
    COALESCE(NEW.raw_user_meta_data->>'gender', 'Other')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ultimate fallback if date casting or anything else throws an error
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, 'Unknown User');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach the creation trigger
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Recreate the update function securely
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name), 
    dob = COALESCE(NULLIF(NEW.raw_user_meta_data->>'dob', '')::date, dob), 
    gender = COALESCE(NEW.raw_user_meta_data->>'gender', gender), 
    updated_at = now() 
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach the update trigger
CREATE TRIGGER on_auth_user_updated 
  AFTER UPDATE ON auth.users 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();
