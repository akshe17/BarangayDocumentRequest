<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\CivilStatusController;


// routes/api.php

Route::middleware('custom.auth')->get('/user', function (Request $request) {
    return response()->json([
        'user' => $request->user()->load('resident'),
        'debug' => 'Used custom middleware successfully!'
    ]);
});
Route::middleware('auth:sanctum')->get('/debug-auth', function (Request $request) {
    return [
        'user' => $request->user(),
        'auth_type' => $request->bearerToken() ? 'Bearer Token' : 'Session Cookie'
    ];
});

Route::post('/register', [AuthController::class, 'register']);


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);

Route::get('/civil-status', [CivilStatusController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Route::post('/logout-all', [AuthController::class, 'logoutAll']); // optional
});