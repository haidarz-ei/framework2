# Laporan Praktikum — Pembuatan Riwayat Pesanan (Frontend)

> **Mata Kuliah:** Pemrograman Web  
> **Topik:** Pembuatan UI/UX Fitur Riwayat Pesanan, Data Pelanggan & Diskon Member  
> **Framework:** React + Tailwind CSS (Vite)  
> **Tanggal:** 27 Mei 2026

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Alur dan Logika Fitur Frontend](#2-alur-dan-logika-fitur-frontend)
3. [Komponen PaymentModal](#3-komponen-paymentmodal-srccomponentspospaymentmodaljsx)
4. [Halaman PelangganPage](#4-halaman-pelangganpage-srcpagespelangganpagejsx)
5. [Halaman PesananPage](#5-halaman-pesananpage-srcpagespesananpagejsx)
6. [Update Routes Konfigurasi](#6-update-routes-konfigurasi-srcroutesindexjsx)

---

## 1. Pendahuluan

Pada praktikum bagian frontend ini, kita akan membuat dan memodifikasi antarmuka pengguna (UI) untuk berinteraksi dengan API backend yang telah dibuat sebelumnya. Fitur-fitur utama yang diimplementasikan meliputi:

- **Modifikasi Proses Pembayaran (POS)**: Menambahkan form pencarian pelanggan berdasarkan nomor handphone, pendaftaran pelanggan baru secara otomatis saat transaksi, serta penerapan diskon otomatis 5% untuk pelanggan member.
- **Manajemen Data Pelanggan**: Membuat halaman CRUD (Create, Read, Update, Delete) untuk data pelanggan serta fitur untuk melihat histori transaksi setiap pelanggan.
- **Riwayat Pesanan**: Membuat halaman yang menampilkan seluruh transaksi yang telah terjadi lengkap dengan detail diskon dan data pelanggan yang bersangkutan.

Integrasi dilakukan menggunakan `axios` untuk melakukan request ke endpoint backend yang diamankan dengan bearer token (Laravel Sanctum).

---

## 2. Alur dan Logika Fitur Frontend

Berikut adalah gambaran besar bagaimana frontend berinteraksi dengan backend untuk fitur Kasir (POS) dan Pelanggan:

```mermaid
flowchart TD
    A[Kasir Input No HP\n(PaymentModal)] --> B{Lookup No HP\nGET /api/pelanggan/phone}
    B -- "Ditemukan" --> C[Tampilkan Info Member\nBerikan Diskon 5%]
    B -- "Tidak Ditemukan" --> D[Tampilkan Form Pelanggan Baru\n(Nama, Alamat)]
    
    C --> E[Konfirmasi Bayar]
    D --> E
    
    E --> F{Apakah Pelanggan Baru?}
    F -- "Ya" --> G[POST /api/pelanggan\nBuat Data Pelanggan]
    F -- "Tidak" --> H
    G --> H[POST /api/orders\nSimpan Transaksi dengan Pelanggan ID & Diskon]
    H --> I[Transaksi Berhasil]
```

---

## 3. Komponen PaymentModal (`src\components\pos\PaymentModal.jsx`)

### Tujuan Dibuat
Komponen ini diubah dari sekadar form input pembayaran menjadi form multi-fungsi yang memungkinkan kasir mencari data pelanggan atau mendaftarkan pelanggan baru saat transaksi sedang berlangsung. Jika pelanggan terdaftar (member), maka sistem akan otomatis memotong total belanja sebesar 5%.

### Hubungan dengan Backend
Komponen ini berinteraksi langsung dengan tiga endpoint backend:
1. `GET /api/pelanggan/phone/{no_hp}` - Untuk melakukan pengecekan apakah nomor HP yang dimasukkan kasir sudah terdaftar.
2. `POST /api/pelanggan` - Untuk mendaftarkan pelanggan baru jika data sebelumnya tidak ditemukan.
3. `POST /api/orders` - Mengirimkan *payload* pesanan (keranjang, `pelanggan_id`, dsb) untuk disimpan ke database.

### Kode Penting: Pencarian Pelanggan dan Pembayaran
```javascript
// Fungsi untuk mencari pelanggan berdasarkan nomor HP
const handlePhoneLookup = async () => {
    if (!phoneInput.trim()) return;
    setLookingUp(true);
    // ... reset state ...
    try {
        const res = await axios.get(`${BASE_URL}/phone/${phoneInput}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setPelanggan(res.data.data); // Pelanggan member ditemukan
        setIsNewCustomer(false);
    } catch {
        // Tidak ditemukan (404 dari backend) -> Tampilkan form pelanggan baru
        setIsNewCustomer(true);
        setNewCustomer({ nama: '', no_hp: phoneInput, alamat: '' });
    } finally {
        setLookingUp(false);
    }
};

// Fungsi memproses transaksi (berhubungan dengan order & member)
const handleBayar = async () => {
    // ... validasi nominal bayar ...
    try {
        let pelangganId = pelanggan?.id || null;

        // Jika pelanggan baru, request buat pelanggan ke backend terlebih dahulu
        if (isNewCustomer && newCustomer.nama && newCustomer.no_hp) {
            const createRes = await axios.post(
                `${BASE_URL}/pelanggan`,
                newCustomer,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            pelangganId = createRes.data.data.id;
        }

        // Susun payload untuk membuat order
        const payload = {
            user_id: user?.id,
            pelanggan_id: pelangganId, // Kirim ID pelanggan (jika ada) ke tabel orders
            shipping_address: pelanggan?.alamat || newCustomer.alamat || 'Kasir POS',
            items: cart.map((i) => ({
                produk_id: i.produk_id,
                quantity: i.quantity,
            })),
        };

        const res = await axios.post(`${BASE_URL}/orders`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // ... transaksi sukses ...
    } catch (err) {
        // ... handle error ...
    }
};
```

**Logika Perhitungan Diskon:**
Pada kode di atas (di luar fungsi) kita memiliki state dan variabel turunan:
```javascript
const DISCOUNT_MEMBER = 5;
const isMember = pelanggan && !isNewCustomer;
const discountAmount = isMember ? Math.round(total * DISCOUNT_MEMBER / 100) : 0;
const totalAfterDiscount = total - discountAmount;
```
Perhitungan ini dilakukan di frontend agar user bisa langsung melihat potongan harga, dan backend juga secara aman akan menghitung atau menyimpan diskon ini.

---

## 4. Halaman PelangganPage (`src\pages\PelangganPage.jsx`)

### Tujuan Dibuat
Halaman ini dirancang sebagai master data untuk mengelola (menambah, mengubah, menghapus, serta melihat) data pelanggan. Di sini juga terdapat fitur inovatif yaitu melihat "Riwayat Transaksi" khusus untuk satu pelanggan, yang menampilkan ringkasan performa belanja pelanggan tersebut.

### Hubungan dengan Backend
- Endpoint `GET /api/pelanggan` untuk memuat daftar pelanggan.
- Endpoint `POST /api/pelanggan` dan `PUT /api/pelanggan/{id}` untuk menyimpan data.
- Endpoint `DELETE /api/pelanggan/{id}` untuk menghapus data.
- Endpoint `GET /api/orders` digunakan untuk mengambil seluruh data order, yang kemudian *difilter di sisi frontend* untuk mencari transaksi milik pelanggan tertentu.

### Kode Penting: Mengambil Riwayat Transaksi Pelanggan
```javascript
const openHistory = async (p) => {
    try {
        // Fetch seluruh orders dari API
        const res = await axios.get(`${BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const allOrders = res.data.data || res.data;
        
        // Melakukan filtering pesanan berdasarkan pelanggan.id yang diklik
        const myOrders = allOrders.filter((o) => o.pelanggan?.id === p.id);
        
        setHistoryData({ pelanggan: p, orders: myOrders });
    } catch (err) {
        console.error(err);
    }
};
```
> [!NOTE]
> Hubungan frontend-backend dalam `OrderResource` (backend) sudah mereturn obyek `pelanggan` lengkap pada respons `/orders`, hal inilah yang membuat frontend mampu melakukan filtering `o.pelanggan?.id === p.id` dengan mudah.

---

## 5. Halaman PesananPage (`src\pages\PesananPage.jsx`)

### Tujuan Dibuat
Sebagai halaman dashboard untuk menampilkan riwayat dan status seluruh transaksi (order) yang pernah dibuat. Halaman ini menyediakan pencarian (berdasarkan kode order, nama pelanggan, no hp pelanggan) dan filter berdasarkan status transaksi. Halaman ini juga memiliki popup detail untuk melihat rincian item, diskon, dan subtotal pesanan.

### Hubungan dengan Backend
Halaman ini mengonsumsi data dari satu endpoint utama yaitu:
`GET /api/orders`
Berkat penyesuaian di `OrderResource` backend, respons JSON sudah mengandung field `discount`, `discount_amount`, dan obyek `pelanggan` yang langsung di-*render* oleh tabel.

### Kode Penting: Rendering Relasi Pelanggan
```javascript
<td className="px-4 py-3">
    {order.pelanggan ? (
        <div>
            <p className="font-semibold">{order.pelanggan.nama}</p>
            <p className="text-gray-500 text-sm">{order.pelanggan.no_hp}</p>
        </div>
    ) : (
        <span className="text-gray-400 text-xs">- Tamu</span>
    )}
</td>
```
Logika di atas menunjukkan keunggulan penggunaan relasi *nullable* di backend (`pelanggan_id` boleh kosong). Jika `order.pelanggan` bernilai *null*, maka aplikasi secara gracefully menampilkannya sebagai pembeli anonim/tamu.

---

## 6. Update Routes Konfigurasi (`src\routes\index.jsx`)

### Tujuan Dibuat
Untuk mendaftarkan halaman komponen yang baru dibuat ke dalam sistem *routing* React (berbasis `react-router-dom`) agar bisa diakses oleh user melalui URL di browser.

### Kode Penting
```javascript
import PesananPage from '../pages/PesananPage';
import PelangganPage from '../pages/PelangganPage';

function MainRoutes() {
  return (
    <Routes>
      {/* Route yang sudah ada */}
      <Route path="/pesanan" element={<PesananPage />} />
      <Route path="/pelanggan" element={<PelangganPage />} />
    </Routes>
  );
}
```
Penambahan route di atas melengkapi struktur aplikasi sehingga menu navigasi dapat diarahkan ke halaman-halaman pengelolaan riwayat transaksi dan data pelanggan dengan baik.
