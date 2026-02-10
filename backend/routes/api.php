<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\CivilStatusController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentRequestController;
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



    Route::get('/documents', [DocumentController::class, 'index']);
Route::post('/documents', [DocumentController::class, 'store']);
Route::put('/documents/{id}', [DocumentController::class, 'update']);
Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);


  Route::post('/request-document', [DocumentRequestController::class, 'store']);

     Route::post('/logout', [AuthController::class, 'logout']);



});

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);

Route::get('/civil-status', [CivilStatusController::class, 'index']);
