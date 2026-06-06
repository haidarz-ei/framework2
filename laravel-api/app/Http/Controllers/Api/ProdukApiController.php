<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use App\Http\Requests\StoreProdukRequest;
use App\Http\Resources\ProdukResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Models\ProdukImage;

class ProdukApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::query();

        // SEARCH
        if ($request->has('search')) {
            $search = $request->search;

            $query->where('namaBarang', 'like', "%{$search}%")
                ->orWhere('kodeBarang', 'like', "%{$search}%");
        }

        // FILTER KATEGORI
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // SORTING HARGA
        if ($request->has('sort')) {

            $sort = $request->sort;

            if ($sort == "harga_asc") {
                $query->orderBy('harga', 'asc');
            }

            if ($sort == "harga_desc") {
                $query->orderBy('harga', 'desc');
            }

        } else {
            $query->latest();
        }

        // $produk = $query->paginate(10);
        $produk = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'List Produk',
            // 'data' => $produk,
            'data' => ProdukResource::collection($produk),
            // 'pagination' => [
            //     'current_page' => $produk->currentPage(),
            //     'last_page' => $produk->lastPage(),
            //     'per_page' => $produk->perPage(),
            //     'total' => $produk->total(),
            //     'first_page_url' => $produk->url(1),
            //     'last_page_url' => $produk->url($produk->lastPage()),
            //     'next_page_url' => $produk->nextPageUrl(),
            //     'prev_page_url' => $produk->previousPageUrl(),
            //     'from' => $produk->firstItem(),
            //     'to' => $produk->lastItem()
            // ]
        ]);
        
            $produk = Produk::paginate(10);

            return response()->json([
                'success' => true,
                'message' => 'List Produk',
                'data' => $produk->items(),
                'pagination' => [
                    'current_page' => $produk->currentPage(),
                    'last_page' => $produk->lastPage(),
                    'per_page' => $produk->perPage(),
                    'total' => $produk->total(),

                    'first_page_url' => $produk->url(1),
                    'last_page_url' => $produk->url($produk->lastPage()),
                    'next_page_url' => $produk->nextPageUrl(),
                    'prev_page_url' => $produk->previousPageUrl(),

                    'from' => $produk->firstItem(),
                    'to' => $produk->lastItem()
                ]
            ]);
    }

    public function store(StoreProdukRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('gambar')) {

            $file = $request->file('gambar');

            $filename = time().'_'.$file->getClientOriginalName();

            $destinationPath = storage_path('app/public/produk/'.$filename);

            // resize image
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file->getRealPath());

            $image->scale(width: 800);

            $image->save($destinationPath);

            $data['gambar'] = 'produk/'.$filename;
        }

        $produk = Produk::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dibuat',
            'data' => new ProdukResource($produk)
        ], 201);
    }

    public function show($id)
    {
        $produk = Produk::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ProdukResource($produk)
        ]);
    }

    public function update(StoreProdukRequest $request, $id)
    {
        $produk = Produk::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('gambar')) {

            // hapus gambar lama
            if ($produk->gambar) {
                Storage::disk('public')->delete($produk->gambar);
            }

            $file = $request->file('gambar');

            $filename = time().'_'.$file->getClientOriginalName();

            $destinationPath = storage_path('app/public/produk/'.$filename);

            $manager = new ImageManager(new Driver());
            $image = $manager->read($file->getRealPath());

            $image->scale(width: 800);

            $image->save($destinationPath, quality: 80);

            $data['gambar'] = 'produk/'.$filename;
        }

        $produk->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Produk Berhasil Diupdate',
            'data' => new ProdukResource($produk)
        ]);
    }

    public function destroy($id)
    {
        $produk = Produk::findOrFail($id);

        foreach ($produk->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $produk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk dan gambar berhasil dihapus'
        ]);
    }

    public function uploadImages(Request $request, $id) 
    {
        $produk = Produk::findOrFail($id);

        $request->validate([
            'gambar' => 'required|array',
            'gambar.*' => 'image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $manager = new ImageManager(new Driver());

        $images = [];

        foreach ($request->file('gambar') as $file) {

            $filename = time().'_'.uniqid().'_'.$file->getClientOriginalName();

            $destinationPath = storage_path('app/public/produk/' . $filename);

            $image = $manager->read($file->getRealPath());

            if ($image->width() > 800) {
                $image->scale(width: 800);
            }

            $image->save($destinationPath, quality: 80);

            $path = 'produk/' . $filename;

            // simpan ke tabel relasi
            $img = ProdukImage::create([
                'produk_id' => $produk->id,
                'path' => $path
            ]);

            $images[] = $img;
        }

        return response()->json([
            'success' => true,
            'message' => 'Multiple images berhasil diupload',
            'data' => $images
        ]);
    }

    public function updateImages(Request $request, $id)
    {
        $produk = Produk::findOrFail($id);

        $request->validate([
            'gambar' => 'required|array',
            'gambar.*' => 'image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $manager = new ImageManager(new Driver());

        // hapus gambar lama
        foreach ($produk->images as $img) {
            Storage::disk('public')->delete($img->path);
            $img->delete();
        }

        $images = [];

        foreach ($request->file('gambar') as $file) {

            $filename = time().'_'.uniqid().'_'.$file->getClientOriginalName();
            $destinationPath = storage_path('app/public/produk/'.$filename);
            $image = $manager->read($file->getRealPath());

            if ($image->width() > 800) {
                $image->scale(width: 800);
            }

            $image->save($destinationPath, quality: 80);
            $path = 'produk/'.$filename;
            $img = ProdukImage::create([
                'produk_id' => $produk->id,
                'path' => $path
            ]);

            $images[] = $img;
        }

        return response()->json([
            'success' => true,
            'message' => 'Images berhasil diupdate',
            'data' => $images
        ]);
    }

}
