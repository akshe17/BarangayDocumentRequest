<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\CivilStatusController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentRequestController;

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminRequestController;
use App\Http\Controllers\ResidentVerificationController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\ResidentNotificationController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ZoneLeaderController;

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
//ADMIN
Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    Route::put('/admin/users/{id}/change-password', [AdminUserController::class, 'changePassword']);
    Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);

      Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);

      //Admin request controller
      
// Get all document requests (with optional filtering and search)
Route::get('/document-requests', [DocumentRequestController::class, 'index']);

// Get statistics for dashboard
Route::get('/admin/document-requests/stats', [AdminRequestController::class, 'getStats']);

// Get a specific document request
Route::get('/document-requests/{id}', [DocumentRequestController::class, 'show']);

// Calculate total for a document request
Route::get('/admin/document-requests', [AdminRequestController::class, 'index']);
Route::get('/admin/document-requests/{id}/calculate-total', [AdminRequestController::class, 'calculateTotal']);


Route::put('/admin/document-requests/{id}/approve', [AdminRequestController::class, 'approve']);


Route::put('/admin/document-requests/{id}/reject', [AdminRequestController::class, 'reject']);

Route::put('/admin/document-requests/{id}/complete', [AdminRequestController::class, 'complete']);


Route::put('/admin/document-requests/{id}/toggle-payment', [AdminRequestController::class, 'togglePaymentStatus']);


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

//resident notifications
Route::get('/resident/notifications', [ResidentNotificationController::class, 'index']);
        Route::put('/resident/notifications/{id}/read', [ResidentNotificationController::class, 'markAsRead']);


        // Zone Leader Routes
        Route::get('/zone-leader/logs', [ZoneLeaderController::class, 'getZoneLogs']);
    Route::get('/zone-leader/residents', [ZoneLeaderController::class, 'getZoneResidents']);
    Route::post('/zone-leader/residents/{id}/verify', [ZoneLeaderController::class, 'verifyResident']);
    Route::post('/zone-leader/residents/{id}/reject', [ZoneLeaderController::class, 'rejectResident']);
});



     Route::post('/logout', [AuthController::class, 'logout']);




Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);
 Route::get('/zones', [ZoneController::class, 'index']);
Route::get('/civil-status', [CivilStatusController::class, 'index']);
