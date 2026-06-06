<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Realtions\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'nama',
        'no_hp',
        'email',
        'alamat'
    ];

    public function pembelians(): HasMany
    {
        return $this->hasMany(Pembelian::class);
    }
}
