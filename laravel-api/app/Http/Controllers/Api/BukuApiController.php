<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BukuApi; 
use Illuminate\Http\Request;

class BukuApiController extends Controller
{
    public function index() 
    { 
        return response()->json(BukuApi::all()); 
    } 

    public function store(Request $request) 
    { 
        $buku = BukuApi::create($request->all());         
        return response()->json($buku, 201); 
    } 

    public function show($id) 
    { 
        return response()->json(BukuApi::findOrFail($id)); 
    } 

    public function update(Request $request, $id) 
    { 
        $buku = BukuApi::findOrFail($id);         
        $buku->update($request->all());

        return response()->json($buku); 
    } 

    public function destroy($id) 
    { 
        BukuApi::destroy($id); 
        return response()->json(['message' => 'Data dihapus']); 
    } 
}
