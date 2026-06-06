<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produk;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        Produk::create([
            'kodeBarang' => 'BRG001',
            'namaBarang' => 'Susu UHT',
            'harga' => 7000,
            'stok' => 10,
            'deskripsi' => 'Susu segar',
            'gambar' => 'produk/susu.png',
            'kategori' => 'Minuman',
            'expiredDate' => '2026-12-01',
            'rating' => 4.5,
        ]);

        Produk::create([
            'kodeBarang' => 'BRG002',
            'namaBarang' => 'Roti Tawar',
            'harga' => 12000,
            'stok' => 8,
            'deskripsi' => 'Roti lembut',
            'gambar' => 'produk/roti.png',
            'kategori' => 'Makanan',
            'expiredDate' => '2026-10-01',
            'rating' => 4.2,
        ]);

        Produk::create([
            'kodeBarang' => 'BRG003',
            'namaBarang' => 'Indomie Goreng',
            'harga' => 3500,
            'stok' => 30,
            'deskripsi' => 'Mie instan favorit',
            'gambar' => 'produk/indomie.png',
            'kategori' => 'Makanan',
            'expiredDate' => '2027-01-01',
            'rating' => 4.8,
        ]);

        Produk::create([
            'kodeBarang' => 'BRG004',
            'namaBarang' => 'Air Mineral',
            'harga' => 4000,
            'stok' => 25,
            'deskripsi' => 'Air minum segar',
            'gambar' => 'produk/air.png',
            'kategori' => 'Minuman',
            'expiredDate' => '2027-05-01',
            'rating' => 4.0,
        ]);

        Produk::create([
            'kodeBarang' => 'BRG005',
            'namaBarang' => 'Biskuit Coklat',
            'harga' => 9000,
            'stok' => 15,
            'deskripsi' => 'Snack manis',
            'gambar' => 'produk/biskuit.png',
            'kategori' => 'Snack',
            'expiredDate' => '2026-11-01',
            'rating' => 4.3,
        ]);
    }
}
