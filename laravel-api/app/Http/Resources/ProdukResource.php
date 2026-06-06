<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdukResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kodeBarang' => $this->kodeBarang,
            'namaBarang' => $this->namaBarang,
            'harga' => $this->harga,
            'stok' => $this->stok,
            'deskripsi' => $this->deskripsi,
            'gambar' => $this->gambar ? asset('storage/'.$this->gambar) : null,
            'kategori' => $this->kategori,
            'expired_date' => $this->expiredDate,
            'rating' => $this->rating,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

