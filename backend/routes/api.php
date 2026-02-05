<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\CivilStatusController;


// api.php - CORRECT
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    \Log::info('=== User Endpoint Hit ===');
    
    try {
        $token = $request->bearerToken();
        \Log::info('Bearer Token Present: ' . ($token ? 'YES' : 'NO'));
        
        if (!$token) {
            \Log::error('No bearer token in request');
            return response()->json(['message' => 'No token provided'], 401);
        }
        
        $user = $request->user();
        \Log::info('User Retrieved: ' . ($user ? 'YES - ID: ' . $user->user_id : 'NO'));
        
        if (!$user) {
            \Log::error('Token present but user not found');
            return response()->json(['message' => 'Invalid token'], 401);
        }
        
        // Try to load relationships
        try {
            if ($user->resident_id) {
                $user->load('resident');
            }
            if ($user->role_id) {
                $user->load('role');
            }
        } catch (\Exception $e) {
            \Log::warning('Could not load relationships: ' . $e->getMessage());
        }
        
        \Log::info('Returning user successfully');
        return response()->json($user);
        
    } catch (\Exception $e) {
        \Log::error('User Endpoint Error: ' . $e->getMessage());
        \Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
        
        return response()->json([
            'error' => $e->getMessage(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ], 500);
    }
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