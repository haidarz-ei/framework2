<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'no_hp' => 'nullable|string|max:20',
        ]);

        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->no_hp = $validated['no_hp'] ?? $user->no_hp;
        $user->save();

        return response()->json([
            'data'    => $user->fresh(),
            'message' => 'Profil berhasil diperbarui',
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'password_lama' => 'required|string',
            'password'      => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password_lama, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai',
                'errors'  => ['password_lama' => ['Password lama tidak sesuai']],
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    public function uploadFoto(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $user = $request->user();

        // Hapus foto lama jika ada
        if ($user->foto) {
            $parsed  = parse_url($user->foto);
            $oldPath = ltrim($parsed['path'] ?? '', '/storage/');
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('foto')->store('foto-profil', 'public');
        $url  = url('storage/' . $path);

        $user->foto = $url;
        $user->save();

        return response()->json([
            'data'    => ['foto' => $url],
            'message' => 'Foto profil berhasil diperbarui',
        ]);
    }
}