<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\CivilStatusController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentRequestController;

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminRequestController;
use App\Http\Controllers\ResidentVerificationController;
use App\Http\Controllers\InboxController;


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
  Route::get('/request-document/history', [DocumentRequestController::class, 'getHistory']);
  Route::get('/resident/dashboard', [DocumentRequestController::class, 'getDashboardStats']);

    Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);

      Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
    Route::get('/admin/requests', [AdminRequestController::class, 'index']);
    Route::patch('/admin/requests/{id}/status', [AdminRequestController::class, 'updateStatus']);


    Route::get('/requests/stats', [DocumentRequestController::class, 'statistics']);
    
    // Resource routes
    Route::apiResource('requests', DocumentRequestController::class);

    // Custom actions
    Route::patch('/requests/{id}/approve', [DocumentRequestController::class, 'approve']);
    Route::patch('/requests/{id}/reject', [DocumentRequestController::class, 'reject']);
    Route::patch('/requests/{id}/complete', [DocumentRequestController::class, 'complete']);
    Route::patch('/requests/{id}/toggle-payment', [DocumentRequestController::class, 'togglePayment']);

    //resident verfication
    Route::get('/residents-get', [ResidentVerificationController::class, 'index']);
  Route::post('/residents/{id}/verify', [ResidentVerificationController::class, 'approve']);
Route::post('/residents/{id}/reject', [ResidentVerificationController::class, 'reject']);

//inbix

// Ensure this is inside your auth middleware group
Route::get('/audit-logs', [InboxController::class, 'index']);

});


     Route::post('/logout', [AuthController::class, 'logout']);




Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);

Route::get('/civil-status', [CivilStatusController::class, 'index']);
