# Stok Opname PGNet — versi GitHub Pages

Tampilan Stok Opname yang dibuka dari GitHub Pages dan bisa dipasang di layar HP.
Datanya tetap dibaca dan ditulis oleh Apps Script "Stock Opname" (Kode.gs).

## Isi repo

| File | Fungsi |
|---|---|
| `index.html` | Aplikasinya, sama persis dengan Index.html di Apps Script |
| `config.js` | **URL Apps Script** (berakhiran `/exec`), satu-satunya yang perlu diubah |
| `api.js` | Jembatan: panggilan ke server lewat internet, plus layar PIN |
| `manifest.json`, `sw.js`, `icon-*.png` | Supaya bisa "Tambahkan ke layar utama" seperti aplikasi |

## Cara pasang (sekali saja)

1. **Apps Script**
   - Tempel `Kode.gs` versi terbaru.
   - Di bagian atas, isi PIN, misalnya `PIN: '1234',`.
   - Simpan.
   - Buka **Terapkan → Kelola deployment → ✏️ Edit**:
     - Versi: **Versi baru**
     - Yang memiliki akses: **Siapa saja**. Wajib, supaya GitHub bisa memanggil server.
   - Klik **Terapkan**. URL-nya tetap sama.
2. **GitHub** (akun PGNetComputer)
   - Buat repo baru, misalnya `StokOpname` (Public).
   - Upload semua file di folder ini.
   - Buka **Settings → Pages → Branch: main / (root) → Save**.
   - Tunggu ±1 menit. Link-nya akan jadi `https://pgnetcomputer.github.io/StokOpname/`.
3. **HP karyawan**
   - Buka link GitHub tadi dan isi PIN sekali.
   - Pilih menu browser **Tambahkan ke layar utama**.

## Kalau ada update

- **Cuma Kode.gs yang berubah:** Terapkan → Kelola deployment → Edit → Versi baru.
- **Index.html berubah:** upload ulang `index.html` ke repo ini. Setelah itu, di HP tutup lalu buka lagi aplikasinya.
- **URL Apps Script berganti:** ubah `config.js` saja.

Link Apps Script lama tetap bisa dipakai. Kalau PIN diisi, link itu juga minta PIN dulu, atau bisa langsung pakai `.../exec?pin=1234`.
