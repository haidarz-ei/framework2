<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_code'        => $this->order_code,
            'status'            => $this->status,
            'shipping_address'  => $this->shipping_address,

            // praktikum 11 - tambah diskon 
            'discount'          => $this->discount,
            'discount_amount'   => $this->discount_amount,

            'total_price'       => $this->total_price,
            'created_at'        => $this->created_at->format('Y-m-d H:i:s'),

            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],

            // praktikum 11 - tambah pelanggan
            'pelanggan' => $this->pelanggan ? [
                'id' => $this->pelanggan->id,
                'nama' => $this->pelanggan->nama,
                'no_hp' => $this->pelanggan->no_hp,
                'alamat' => $this->pelanggan->alamat,
            ] : null,

            'items' => $this->items->map(function ($item) {
                return [
                    'produk_id'     => $item->produk->id,
                    'produk_name'   => $item->produk->namaBarang ?? null,
                    'price'         => $item->price,
                    'quantity'      => $item->quantity,
                    'subtotal'      => $item->subtotal,
                ];
            }),
        ];
    }
}
