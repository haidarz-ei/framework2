<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BukuApi extends Model
{
    protected $fillable = [
        'judul',
        'penulis',
        'tahun_terbit'
    ]; 
}
