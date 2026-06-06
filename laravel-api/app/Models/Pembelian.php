<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembelian extends Model
{
    protected $fillable = [
        'no_pembelian',
        'supplier_id',
        'user_id',
        'tanggal_pembelian',
        'total_harga',
        'status',
        'keterangan'
    ];

    protected $casts = [
        'tanggal_pembelian' => 'date',
        'total_harga' => 'float',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PembelianItem::class);
    }
}

