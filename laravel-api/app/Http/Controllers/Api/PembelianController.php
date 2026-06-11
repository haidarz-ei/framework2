<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pembelian;
use App\Models\PembelianItem;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PembelianController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pembelian::with(['supplier', 'user', 'items.produk'])
            ->orderBy('tanggal_pembelian', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_pembelian', 'like', "%$search%")
                    ->orWhereHas('supplier', fn($q2) => $q2->where('nama', 'like', "%$search%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tanggal_pembelian', '>=', $request->dari_tanggal);
        }

        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tanggal_pembelian', '<=', $request->sampai_tanggal);
        }

        $pembelians = $query->paginate(15);
        return response()->json($pembelians);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id'       => 'required|exists:suppliers,id',
            'tanggal_pembelian' => 'required|date',
            'keterangan'        => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.produk_id' => 'nullable|exists:produks,id',
            'items.*.quantity'  => 'required|integer|min:1',
            'items.*.harga_beli' => 'required|numeric|min:0',
            // field produk baru (opsional), jika produk_id kosong
            'items.*.new_produk.kodeBarang' => 'nullable|string|max:50',
            'items.*.new_produk.namaBarang' => 'nullable|string|max:255',
            'items.*.new_produk.kategori' => 'nullable|string|max:100',
            'items.*.new_produk.harga' => 'nullable|numeric|min:0',
            'items.*.new_produk.stok' => 'nullable|integer|min:0',

        ]);

        DB::beginTransaction();
        try {
            $noPembelian = 'PB-' . date('Ymd') . '-' . str_pad(
                Pembelian::whereDate('created_at', today())->count() + 1, 
                4, '0', STR_PAD_LEFT
            );

            $totalHarga = 0;
            $itemsData = [];


            

            foreach ($validated['items'] as $item) {
                $produkId = $item['produk_id'] ?? null;

                // buat produk baru jika tidak ada produk_id
                if (!$produkId && !empty($item['new_produk']['namaBarang'])) {
                    $np = $item['new_produk'];

                    // auto-generate kodeBarang jika kosong
                    if (empty($np['kodeBarang'])) {
                        $np['kodeBarang'] = 'BRG-' . strtoupper(substr(md5(uniqid()), 0, 6));
                    }

                    $produkBaru = Produk::create([
                        'kodeBarang' => $np['kodeBarang'],
                        'namaBarang' => $np['namaBarang'],
                        'kategori'   => $np['kategori'] ?? 'null',
                        'harga'      => $np['harga'] ?? $item['harga_beli'],
                        'stok'       => $np['stok'] ?? 0,
                        'rating'     => 0,
                    ]);

                    $produkId = $produkBaru->id;
                }

                if (!$produkId) continue;

                $subtotal = $item['quantity'] * $item['harga_beli'];
                $totalHarga += $subtotal;
                $itemsData[] = [
                    'produk_id'     => $produkId,
                    'quantity'      => $item['quantity'],
                    'harga_beli'    => $item['harga_beli'],
                    'subtotal'      => $subtotal,
                ];
            }

            if (empty($itemsData)) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Tidak ada item valid dalam pembelian',
                ], 422);
            }

            $pembelian = Pembelian::create([
                'no_pembelian'      => $noPembelian,
                'supplier_id'       => $validated['supplier_id'],
                'user_id'           => request()->user()->id,
                'tanggal_pembelian' => $validated['tanggal_pembelian'],
                'total_harga'       => $totalHarga,
                'status'            => 'pending',
                'keterangan'        => $validated['keterangan'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                $pembelian->items()->create($item);
            }

            DB::commit();

            return response()->json([
                'data' => $pembelian->load(['supplier', 'user', 'items.produk']),
                'message' => 'Pembelian berhasil dibuat',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat pembelian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Pembelian $pembelian): JsonResponse
    {
        return response()->json([
            'data' => $pembelian->load(['supplier', 'user', 'items.produk']),
        ]);
    }

    public function updateStatus(Request $request, Pembelian $pembelian): JsonResponse
    {
        $validate = $request->validate([
            'status' => 'required|in:pending,diterima,dibatalkan'
        ]);

        if ($pembelian->status === 'diterima') {
            return response()->json([
                'message' => 'Pembelian sudah diterima, tidak bisa diubah statusnya',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $pembelian->update(['status' => $validate['status']]);

            if ($validate['status'] === 'diterima') {
                foreach ($pembelian->items as $item) {
                    $produk = Produk::find($item->produk_id);
                    if ($produk) { 
                        $stokField = $produk->stok !== null ? 'stok' : 'quantity';
                        $produk->increment($stokField, $item->quantity);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'data' => $pembelian->fresh(['supplier', 'user', 'items.produk']),
                'message' => 'Status pembelian berhasil diubah',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal update status: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Pembelian $pembelian): JsonResponse
    {
        if ($pembelian->status === 'diterima') {
            return response()->json([
                'message' => 'Pembelian sudah diterima, tidak bisa dihapus',
            ], 422);
        }

        $pembelian->delete();
        return response()->json([
            'message' => 'Pembelian berhasil dihapus',
        ]);
    }
}
