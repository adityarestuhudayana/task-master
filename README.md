# TaskMaster

> [!WARNING]
> **Penting**: Fitur pendaftaran (Sign-up) memerlukan konfigurasi SMTP yang aktif untuk verifikasi email. Jika SMTP tidak dikonfigurasi, Anda tidak akan bisa melakukan pendaftaran baru. 
> 
> Sebagai alternatif, gunakan salah satu dari **5 Akun Demo** berikut (Password: `password123`):
> - `budi@indo.com`
> - `siti@indo.com`
> - `joko@indo.com`
> - `dewi@indo.com`
> - `agus@indo.com`

TaskMaster adalah platform manajemen tugas (task management) kolaboratif modern yang dirancang untuk membantu tim merencanakan, melacak, dan mengelola pekerjaan secara efisien dalam satu tempat.

## ️ Stack Teknologi

- **Monorepo**: Turbo, pnpm
- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL, Socket.io, Better Auth, Nodemailer (Gmail SMTP).
- **Frontend**: React, Vite, Tanstack Query, Tailwind CSS, Lucide React, Radix UI.
- **Lainnya**: Sentry (monitoring), Cloudinary (storage), Zod (validasi).

## 🔄 App Flow

1.  **Onboarding**: Daftar akun baru dan verifikasi email Anda melalui link yang dikirim ke inbox.
2.  **Setup Ruang Kerja**: Buat `Workspace` baru atau bergabunglah ke workspace tim Anda.
3.  **Persiapan Board**: Buat `Board` di dalam workspace untuk proyek atau departemen tertentu.
4.  **Eksekusi Tugas**:
    *   Tambahkan `Task` ke kolom "Akan Dilakukan".
    *   Tugaskan member, tambahkan label prioritas, dan tentukan deadline.
    *   Geser kartu tugas antar kolom seiring kemajuan pekerjaan.
5.  **Interaksi**: Berikan komentar pada tugas untuk berdiskusi dengan tim secara langsung.

## ⚙️ Cara Install

Ikuti langkah-langkah di bawah ini untuk menjalankan TaskMaster di lingkungan lokal:

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- PostgreSQL

### 2. Instalasi Dependensi
```bash
# Clone repository
git clone <repository-url>
cd task-master

# Install semua paket
pnpm install
```

### 3. Konfigurasi Environment
Buat file `.env` di masing-masing direktori berikut berdasarkan file `.env.example`:

**Backend (`apps/server/.env`)**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskmaster
BETTER_AUTH_SECRET=rahasia-anda
BETTER_AUTH_URL=http://localhost:3000
SMTP_SERVICE=gmail
SMTP_USER=email-anda@gmail.com
SMTP_PASS=app-password-16-digit
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend (`apps/web/.env`)**:
```env
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=nama-cloud-anda
```

### 4. Setup Database
```bash
cd apps/server
pnpm db:push
# (Opsional) Untuk mengisi data dummy:
pnpm db:seed
```

### 5. Jalankan Aplikasi
Kembali ke root direktori dan jalankan:
```bash
pnpm dev
```
Aplikasi akan tersedia di:
- Frontend: `http://localhost:5173`
- API Backend: `http://localhost:3000`

---
Dibuat dengan ❤️ untuk produktivitas tim yang lebih baik.
