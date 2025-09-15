-- Allow users to insert their own profile rows in public.users
-- This complements the trigger-based creation and ensures app can self-heal

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Insert policy: user may insert a row where id matches auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);
