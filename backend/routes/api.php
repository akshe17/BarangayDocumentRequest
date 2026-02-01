<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->get('/debug-auth', function (Request $request) {
    return [
        'user' => $request->user(),
        'auth_type' => $request->bearerToken() ? 'Bearer Token' : 'Session Cookie'
    ];
});

Route::post('/register', [AuthController::class, 'register']);

Route::get('/genders', [GenderController::class, 'index']);