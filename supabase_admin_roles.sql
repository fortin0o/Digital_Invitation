-- ========================================================
-- SISTEM MULTI-ROLE & MANAJEMEN ADMIN (SUPER ADMIN vs ADMIN)
-- Skrip SQL untuk tabel admin_users dan Row Level Security (RLS)
-- Jalankan di SQL Editor Supabase: https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- 1. Buat Tabel admin_users jika belum ada
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nama text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Normalisasi email agar selalu huruf kecil & bebas spasi (konsisten saat edit manual via Table Editor)
UPDATE public.admin_users
SET email = lower(trim(email))
WHERE email <> lower(trim(email));

CREATE OR REPLACE FUNCTION public.normalize_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_admin_email ON public.admin_users;
CREATE TRIGGER trg_normalize_admin_email
BEFORE INSERT OR UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.normalize_admin_email();

-- 2. Fungsi Helper Cek Peran Admin (SECURITY DEFINER agar bebas rekursi RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND role = 'super_admin'
  );
$$;

-- RPC aman untuk memeriksa apakah 1 email terdaftar di allowlist (tanpa membuka seluruh daftar admin ke anon)
CREATE OR REPLACE FUNCTION public.check_admin_allowlist(p_email text)
RETURNS TABLE (authorized boolean, role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.admin_users a
      WHERE lower(a.email) = lower(trim(coalesce(p_email, '')))
    ) AS authorized,
    (
      SELECT a.role::text
      FROM public.admin_users a
      WHERE lower(a.email) = lower(trim(coalesce(p_email, '')))
      LIMIT 1
    ) AS role;
$$;

REVOKE ALL ON FUNCTION public.check_admin_allowlist(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_admin_allowlist(text) TO anon, authenticated;

-- 3. Aktifkan Keamanan Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Hak Akses (Policies)
DROP POLICY IF EXISTS "Allow authenticated read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated write admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public read admin_users" ON public.admin_users;

-- Hanya user yang sudah login boleh membaca baris miliknya sendiri, atau Super Admin membaca seluruh daftar admin
CREATE POLICY "Allow authenticated read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR public.is_super_admin()
);

-- Hanya Super Admin terdaftar yang boleh menambah/mengubah/menghapus admin
CREATE POLICY "Allow authenticated write admin_users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 5. Trigger Sinkronisasi: Otomatis Hapus Akun di auth.users saat Admin Dihapus
-- (Memastikan akun auth Supabase ikut terhapus bersih saat Super Admin menghapus dari admin_users)
CREATE OR REPLACE FUNCTION public.handle_admin_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM auth.users WHERE lower(email) = lower(OLD.email);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_user_deleted ON public.admin_users;
CREATE TRIGGER trg_admin_user_deleted
AFTER DELETE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_user_deleted();

-- 6. Catatan Seed Awal (Opsional — uncomment hanya jika tabel admin_users masih kosong):
-- INSERT INTO public.admin_users (email, nama, role)
-- VALUES
--   ('admin@example.com', 'Super Admin Wedding UKK', 'super_admin'),
--   ('mempelai@example.com', 'Panitia Mempelai', 'admin')
-- ON CONFLICT (email) DO NOTHING;

-- Selesai! Tabel admin_users & RPC allowlist siap digunakan oleh Next.js Admin Panel.
