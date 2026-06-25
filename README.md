# restapisupabase

## Versi JavaScript

File utama API JavaScript:

- `app.js`

### Instalasi

1. Pastikan Node.js sudah terpasang.
2. Jalankan:

```bash
npm install
```

3. Buat file `.env` di folder proyek dengan variabel:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-api-key
TABLE=mahasiswa
```

4. Jalankan server:

```bash
npm start
```

### Endpoint

- `GET /` - kirim `index.html`
- `POST /login` - login ke Supabase
- `GET /mahasiswa` - ambil data mahasiswa
- `POST /mahasiswa` - tambah data mahasiswa
- `PUT /mahasiswa/:id` - update data mahasiswa
- `DELETE /mahasiswa/:id` - hapus data mahasiswa

> Untuk endpoint `mahasiswa`, sertakan header `Authorization: Bearer <token>` yang diterima dari `/login`.
