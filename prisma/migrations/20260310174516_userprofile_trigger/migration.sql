-- CreateFunction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public."UserProfile"(id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- CreateTrigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();