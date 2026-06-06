<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembelianItem extends Model
{
    protected $fillable = [
        'pembelian_id',
        'produk_id',
        'quantity',
        'harga_beli',
        'subtotal'
    ];

    protected $casts = [
        'harga_beli' => 'float',
        'subtotal' => 'float',
    ];

    public function pembelian(): BelongsTo
    {
        return $this->belongsTo(Pembelian::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }
}
