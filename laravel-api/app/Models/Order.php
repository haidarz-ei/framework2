<?php
// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        // tambah pelanggan (praktikum 11)
        'pelanggan_id',
        'order_code',
        'total_price',
        // tambah diskon (praktikum 11)
        'discount',
        'discount_amount',
        'status',
        'shipping_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    // praktikum 11
    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id');  
    }
}

