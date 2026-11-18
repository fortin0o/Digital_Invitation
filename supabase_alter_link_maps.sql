-- ========================================================
-- MIGRASI: Perpanjang Kolom link_maps & alamat pada Tabel undangan
-- Jalankan di SQL Editor Supabase: https://supabase.com/dashboard/project/_/sql
-- ========================================================
-- Masalah: Sebelumnya link_maps bertipe VARCHAR(200), sehingga jika admin memasukkan
-- URL Google Maps lengkap (> 200 karakter) akan terjadi error:
-- "value too long for type character varying(200)"
-- Solusi: Ubah tipe kolom menjadi TEXT tanpa batasan panjang.
-- ========================================================

ALTER TABLE public.undangan
ALTER COLUMN link_maps TYPE text;

ALTER TABLE public.undangan
ALTER COLUMN alamat TYPE text;

-- Verifikasi perubahan kolom
COMMENT ON COLUMN public.undangan.link_maps IS 'Tautan Google Maps lengkap (tipe TEXT, mendukung > 200 karakter)';
