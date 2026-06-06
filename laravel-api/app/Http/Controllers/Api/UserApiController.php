<?php 

namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller; 
use App\Models\UserApi; 
use Illuminate\Http\Request; 

class UserApiController extends Controller 
{ 
    public function index() 
    { 
        return response()->json(UserApi::all()); 
    } 

    public function store(Request $request) 
    { 
        $user = UserApi::create($request->all());         
        return response()->json($user, 201); 
    } 

    public function show($id) 
    { 
        return response()->json(UserApi::findOrFail($id)); 
    } 

    public function update(Request $request, $id) 
    { 
        $user = UserApi::findOrFail($id);         
        $user->update($request->all());

        return response()->json($user); 
    } 

    public function destroy($id) 
    { 
        UserApi::destroy($id); 
        return response()->json(['message' => 'Data dihapus']); 
    } 
} 
