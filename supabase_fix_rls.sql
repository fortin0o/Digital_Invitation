-- ========================================================
-- KEAMANAN RLS & FLOW RSVP TERVALIDASI (STEP 1)
-- Skrip SQL Supabase untuk Proteksi Tabel undangan, tamu, rsvp, ucapan
-- Jalankan di SQL Editor Supabase: https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- Helper verifikasi admin (pastikan tabel public.admin_users sudah dibuat via supabase_admin_roles.sql)
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

-- --------------------------------------------------------
-- 1. TABEL: undangan
-- Publik boleh membaca detail acara. Hanya Admin yang boleh mengubah.
-- --------------------------------------------------------

-- Perpanjang tipe data link_maps & alamat menjadi TEXT agar dapat menampung URL Google Maps panjang (> 200 karakter)
ALTER TABLE public.undangan ALTER COLUMN link_maps TYPE text;
ALTER TABLE public.undangan ALTER COLUMN alamat TYPE text;

ALTER TABLE public.undangan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on undangan" ON public.undangan;
DROP POLICY IF EXISTS "Allow admin all on undangan" ON public.undangan;

CREATE POLICY "Allow public select on undangan"
ON public.undangan
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow admin all on undangan"
ON public.undangan
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- --------------------------------------------------------
-- 2. TABEL: tamu
-- Publik (anon) TIDAK bisa meng-query seluruh daftar tamu & kode secara langsung.
-- Pencarian tamu publik dilakukan secara ketat per kode via RPC get_guest_by_code.
-- Hanya Admin terdaftar yang bisa membaca/menambah/mengubah/menghapus tamu.
-- --------------------------------------------------------

ALTER TABLE public.tamu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on tamu" ON public.tamu;
DROP POLICY IF EXISTS "Allow public insert to tamu" ON public.tamu;
DROP POLICY IF EXISTS "Allow admin all on tamu" ON public.tamu;

CREATE POLICY "Allow admin all on tamu"
ON public.tamu
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- --------------------------------------------------------
-- 3. TABEL: rsvp
-- Pastikan FK ke tamu memakai ON DELETE CASCADE dan id_tamu bersifat UNIQUE.
-- Publik TIDAK bisa membaca/mengubah semua RSVP secara langsung;
-- update RSVP publik hanya melalui RPC submit_guest_rsvp yang tervalidasi kode & kuota.
-- --------------------------------------------------------

DO $$
DECLARE
  v_conname text;
  v_deltype "char";
BEGIN
  SELECT conname, confdeltype
  INTO v_conname, v_deltype
  FROM pg_constraint
  WHERE conrelid = 'public.rsvp'::regclass
    AND contype = 'f'
    AND confrelid = 'public.tamu'::regclass
  LIMIT 1;

  IF v_conname IS NULL THEN
    ALTER TABLE public.rsvp
      ADD CONSTRAINT rsvp_id_tamu_fkey
      FOREIGN KEY (id_tamu)
      REFERENCES public.tamu(id_tamu)
      ON DELETE CASCADE;
  ELSIF v_deltype <> 'c' THEN
    EXECUTE format('ALTER TABLE public.rsvp DROP CONSTRAINT %I', v_conname);
    ALTER TABLE public.rsvp
      ADD CONSTRAINT rsvp_id_tamu_fkey
      FOREIGN KEY (id_tamu)
      REFERENCES public.tamu(id_tamu)
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = 'public.rsvp'::regclass
      AND i.indisunique
      AND i.indnatts = 1
      AND i.indpred IS NULL
      AND a.attname = 'id_tamu'
  ) THEN
    ALTER TABLE public.rsvp ADD CONSTRAINT rsvp_id_tamu_key UNIQUE (id_tamu);
  END IF;
END
$$;

ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on rsvp" ON public.rsvp;
DROP POLICY IF EXISTS "Allow public insert to rsvp" ON public.rsvp;
DROP POLICY IF EXISTS "Allow public update to rsvp" ON public.rsvp;
DROP POLICY IF EXISTS "Allow admin all on rsvp" ON public.rsvp;

CREATE POLICY "Allow admin all on rsvp"
ON public.rsvp
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- --------------------------------------------------------
-- 4. RPC PUBLIK AMAN UNTUK TAMU & RSVP
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_guest_by_code(
  p_kode text,
  p_id_undangan uuid DEFAULT NULL
)
RETURNS TABLE (
  id_tamu uuid,
  id_undangan uuid,
  nama_tamu text,
  kode text,
  kuota integer,
  rsvp_status text,
  rsvp_jumlah_hadir integer,
  rsvp_tgl_konfirmasi timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id_tamu,
    t.id_undangan,
    t.nama_tamu::text,
    t.kode::text,
    t.kuota::integer,
    r.status::text AS rsvp_status,
    r.jumlah_hadir::integer AS rsvp_jumlah_hadir,
    r.tgl_konfirmasi AS rsvp_tgl_konfirmasi
  FROM public.tamu t
  LEFT JOIN public.rsvp r ON r.id_tamu = t.id_tamu
  WHERE lower(trim(t.kode)) = lower(trim(coalesce(p_kode, '')))
    AND trim(coalesce(p_kode, '')) <> ''
    AND (p_id_undangan IS NULL OR t.id_undangan = p_id_undangan)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_guest_by_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_by_code(text, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_guest_rsvp(
  p_kode text,
  p_status text,
  p_jumlah_hadir integer,
  p_id_undangan uuid DEFAULT NULL
)
RETURNS TABLE (
  id_rsvp uuid,
  id_tamu uuid,
  status text,
  jumlah_hadir integer,
  tgl_konfirmasi timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_tamu public.tamu%ROWTYPE;
  v_status text;
  v_kuota integer;
  v_jumlah integer;
BEGIN
  v_status := lower(trim(coalesce(p_status, '')));
  IF v_status NOT IN ('hadir', 'tidak_hadir', 'ragu') THEN
    RAISE EXCEPTION 'Status RSVP tidak valid: harus hadir, tidak_hadir, atau ragu.';
  END IF;

  SELECT *
  INTO v_tamu
  FROM public.tamu t
  WHERE lower(trim(t.kode)) = lower(trim(coalesce(p_kode, '')))
    AND trim(coalesce(p_kode, '')) <> ''
    AND (p_id_undangan IS NULL OR t.id_undangan = p_id_undangan)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kode undangan tidak ditemukan di daftar tamu resmi.';
  END IF;

  v_kuota := GREATEST(coalesce(v_tamu.kuota, 1), 1);

  IF v_status = 'tidak_hadir' THEN
    v_jumlah := 0;
  ELSE
    v_jumlah := LEAST(GREATEST(coalesce(p_jumlah_hadir, 1), 1), v_kuota);
  END IF;

  RETURN QUERY
  INSERT INTO public.rsvp (id_tamu, status, jumlah_hadir, tgl_konfirmasi)
  VALUES (v_tamu.id_tamu, v_status, v_jumlah, now())
  ON CONFLICT (id_tamu)
  DO UPDATE SET
    status = EXCLUDED.status,
    jumlah_hadir = EXCLUDED.jumlah_hadir,
    tgl_konfirmasi = EXCLUDED.tgl_konfirmasi
  RETURNING
    public.rsvp.id_rsvp,
    public.rsvp.id_tamu,
    public.rsvp.status::text,
    public.rsvp.jumlah_hadir::integer,
    public.rsvp.tgl_konfirmasi;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_guest_rsvp(text, text, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_guest_rsvp(text, text, integer, uuid) TO anon, authenticated;


-- --------------------------------------------------------
-- 5. TABEL: ucapan (Buku Tamu)
-- Publik boleh membaca dan mengirim ucapan jika nama, pesan, dan id_undangan valid.
-- --------------------------------------------------------

ALTER TABLE public.ucapan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on ucapan" ON public.ucapan;
DROP POLICY IF EXISTS "Allow public insert to ucapan" ON public.ucapan;
DROP POLICY IF EXISTS "Allow admin all on ucapan" ON public.ucapan;

CREATE POLICY "Allow public select on ucapan"
ON public.ucapan
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to ucapan"
ON public.ucapan
FOR INSERT
TO anon, authenticated
WITH CHECK (
  trim(coalesce(nama, '')) <> ''
  AND trim(coalesce(isi_ucapan, '')) <> ''
  AND EXISTS (
    SELECT 1 FROM public.undangan u
    WHERE u.id_undangan = public.ucapan.id_undangan
  )
);

CREATE POLICY "Allow admin all on ucapan"
ON public.ucapan
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
