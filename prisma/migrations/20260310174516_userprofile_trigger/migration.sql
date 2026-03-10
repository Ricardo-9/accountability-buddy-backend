DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname = 'auth'
  ) THEN

    --CreateFunction
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    BEGIN
      INSERT INTO public."UserProfile"(id)
      VALUES (NEW.id)
      ON CONFLICT (id) DO NOTHING;

      RETURN NEW;
    END;
    $func$;

    --DropTrigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- CreateTrigger
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

  END IF;
END
$$;