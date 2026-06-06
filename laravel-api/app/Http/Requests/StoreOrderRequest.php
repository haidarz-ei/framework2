<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id'           => 'required|exists:users,id',
            'shipping_address'  => 'required|string',
            // tambah pelanggan (praktikum 11)
            'pelanggan_id'      => 'nullable|exists:pelanggan,id',
            'items'             => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:produks,id',
            'items.*.quantity'  => 'required|integer|min:1',
        ];
    }

    public function message(): array
    {
        return [
            'user_id.exists'            => 'User tidak ditemukan',
            'items.required'            => 'Keranjang belanja kosong',
            'items.*.produk_id.exists'  => 'Produk tidak ditemukan',
            'items.*.quantity.min'      => 'Jumlah produk harus minimal 1',
        ];
    }
}
