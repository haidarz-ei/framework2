<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\BukuApiController;
use App\Http\Controllers\Api\ProdukApiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\OrderApiController;
use App\Http\Controllers\Api\PelangganController;
use App\Http\Controllers\Api\PembelianController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProfileController;

use Illuminate\Http\Request;

Route::apiResource('users', UserApiController::class);
Route::apiResource('bukus', BukuApiController::class);
Route::apiResource('produks', ProdukApiController::class);
Route::post('/produks/{id}/images', [ProdukApiController::class, 'uploadImages']);
Route::apiResource('orders', OrderApiController::class);
Route::put('orders/{id}/status', [OrderApiController::class, 'updateStatus']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user(); 
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/foto', [ProfileController::class, 'uploadFoto']);

    // pelanggan
    Route::get('/pelanggan', [PelangganController::class, 'index']);
    Route::post('/pelanggan', [PelangganController::class, 'store']);
    Route::get('/pelanggan/phone/{no_hp}', [PelangganController::class, 'findByPhone']);
    Route::put('/pelanggan/{id}', [PelangganController::class, 'update']);
    Route::delete('/pelanggan/{id}', [PelangganController::class, 'destroy']);

    // supplier
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);

    // pembelian
    Route::get('/pembelians', [PembelianController::class, 'index']);
    Route::post('/pembelians', [PembelianController::class, 'store']);
    Route::get('/pembelians/{pembelian}', [PembelianController::class, 'show']);
    Route::patch('/pembelians/{pembelian}/status', [PembelianController::class, 'updateStatus']);
    Route::delete('/pembelians/{pembelian}', [PembelianController::class, 'destroy']);
});

Route::get('/', function () {
    return 'API is sukses';
});
