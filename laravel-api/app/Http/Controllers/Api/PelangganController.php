<?php
// app/Http/Controllers/Api/PelangganController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use Illuminate\Http\Request;

class PelangganController extends Controller
{
    public function index()
    {
        $pelanggan = Pelanggan::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $pelanggan
        ]);
    }

    public function findByPhone($no_hp)
    {
        $pelanggan = Pelanggan::where('no_hp', $no_hp)->first();

        if (!$pelanggan) {
            return response()->json([
                'success' => false,
                'message' => 'Pelanggan tidak ditemukan' ,
            ], 404);
        } 
        return response()->json([
            'success' => true,
            'data' => $pelanggan
        ]);
        
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20|unique:pelanggan,no_hp',
            'alamat' => 'required|string|max:500',
        ]);

        $pelanggan = Pelanggan::create($request->only('nama', 'no_hp', 'alamat'));

        return response()->json([
            'success' => true,
            'data' => $pelanggan
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $pelanggan = Pelanggan::findOrFail($id);

        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'no_hp' => 'sometimes|string|max:20|unique:pelanggan,no_hp,' . $pelanggan->id,
            'alamat' => 'nullable|string|max:500',
        ]);

        $pelanggan->update($request->only('nama', 'no_hp', 'alamat'));

        return response()->json([
            'success' => true,
            'data' => $pelanggan
        ]);
    }

    public function destroy($id)
    {
        Pelanggan::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pelanggan berhasil dihapus'
        ]);
    }
}