<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\CivilStatusController;
use App\Http\Controllers\ResidentController;

// routes/api.php

Route::middleware('custom.auth')->get('/user', function (Request $request) {
    return response()->json([
        'user' => $request->user()->load('resident'),
        'debug' => 'Used custom middleware successfully!'
    ]);

     
});
Route::middleware(['custom.auth'])->group(function () {
    // Profile Management Routes
    Route::post('/resident/profile/update', [ResidentController::class, 'updateProfile']);
    Route::post('/resident/profile/change-password', [ResidentController::class, 'changePassword']);
    Route::post('/resident/profile/upload-id', [ResidentController::class, 'uploadValidId']);
     Route::post('/logout', [AuthController::class, 'logout']);

});

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);

Route::get('/civil-status', [CivilStatusController::class, 'index']);
