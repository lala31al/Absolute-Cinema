# 🎬 Absolute Cinema

**Absolute Cinema** adalah platform web interaktif untuk pencarian film, manajemen koleksi, dan pembuatan peringkat film (Tier List). Aplikasi ini mengintegrasikan data real-time dari **TMDB API** dengan fitur personalisasi pengguna yang disimpan dalam database MySQL lokal.

Proyek ini dibangun dengan antarmuka **Dark Mode / Cinematic** yang modern dan responsif.

---

## ✨ Fitur Utama

### 1. 🔍 Discovery & Eksplorasi
* **Real-time Data:** Mengambil data film terbaru (*Now Playing, Popular*) langsung dari TMDB.
* **Pencarian Canggih:** Cari film berdasarkan judul dengan fitur *debounce* agar efisien.
* **Smart Filtering:** Filter film berdasarkan:
  * **Genre:** Action, Horror, Comedy, dll.
  * **Rating:** Cari film dengan rating tinggi (misal: ⭐ 8+).
  * **Durasi:** Filter film pendek (< 90m) atau panjang (> 2h).
* **Sorting:** Urutkan berdasarkan Judul, Durasi, atau Rating Tertinggi.

### 2. 📝 Manajemen Koleksi (Auth Required)
* **Tier List Maker:**
  * Buat daftar peringkat film sendiri (misal: "Marvel Movies Ranked").
  * Tambahkan film ke dalam list melalui pencarian.
  * **Custom Ordering:** Ubah posisi urutan film (Naik/Turun) dengan tombol interaktif.
* **Watchlist:** Simpan film yang ingin ditonton nanti dengan satu klik.

### 3. ⭐ Ulasan & Komunitas
* **Rating & Review:** Berikan skor bintang (1-10) dan tulis ulasan untuk film.
* **User Profile:** Lihat ulasan dan rating yang pernah dibuat.

### 4. 🎨 User Interface (UI)
* **Glassmorphism Navbar:** Navigasi modern dengan efek blur.
* **Cinematic Dark Mode:** Nyaman di mata dan cocok untuk tema film.
* **Responsive Design:** Tampilan rapi di Desktop, Tablet, dan Mobile.

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, **Bootstrap 5**, Vanilla JavaScript (ES6+) |
| **Backend** | **Node.js**, **Express.js** |
| **Database** | **MySQL** (Relational Database) |
| **Auth** | JSON Web Token (JWT) |
| **API** | The Movie Database (TMDB) API |

---

