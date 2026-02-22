<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Ensure this is imported
use App\Http\Controllers\GenderController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\CivilStatusController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\ResidentDocumentController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\ClerkController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminRequestController;
use App\Http\Controllers\ResidentVerificationController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\ResidentNotificationController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ZoneLeaderController;
use App\Http\Controllers\AdminResidentController;
use App\Http\Controllers\AdminDocumentController;



Route::middleware('custom.auth')->get('/user', function (Request $request) {
    return response()->json([
        'user' => $request->user()->load('resident'),
        'debug' => 'Used custom middleware successfully!'
    ]);

     
});
  Route::put('/resident/resubmit-id', [ResidentController::class, 'resubmitID']);

Route::middleware(['custom.auth'])->group(function () {
     Route::post('/auth/update-name',     [AuthController::class, 'updateName']);
    Route::post('/auth/update-email',    [AuthController::class, 'updateEmail']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    //admin resident


    Route::get('/admin/residents', [AdminResidentController::class, 'index']);
    Route::put('/admin/residents/{id}/verify', [AdminResidentController::class, 'verify']);
    Route::delete('/admin/residents/{id}', [AdminResidentController::class, 'destroy']);

    //admin document
  Route::get('document-types',         [AdminDocumentController::class, 'index']);
    Route::post('document-types',         [AdminDocumentController::class, 'store']);
    Route::get('document-types/{id}',     [AdminDocumentController::class, 'show']);

    // POST with _method=PUT inside FormData — supports file upload
  Route::post('document-types/{id}', [AdminDocumentController::class,  'update']);
Route::put('document-types/{id}',  [AdminDocumentController::class, 'update']);
    Route::patch('document-types/{id}',    [AdminDocumentController::class, 'patch']);
    Route::delete('document-types/{id}',   [AdminDocumentController::class,'destroy']);
    // Profile Management Routes
    Route::post('/resident/profile/update', [ResidentController::class, 'updateProfile']);
      

    Route::post('/resident/profile/change-password', [ResidentController::class, 'changePassword']);
    Route::post('/resident/profile/upload-id', [ResidentController::class, 'uploadValidId']);


//resident document

     Route::get('/documents',         [ResidentDocumentController::class, 'index']);
       Route::get('/resident/dashboard',          [ResidentDocumentController::class, 'getResidentDashboard']);
         Route::get('/resident-logs',   [ResidentDocumentController::class, 'getResidentLogs']);
    Route::get('/current-request',    [ResidentDocumentController::class, 'residentCurrentRequest']);
    Route::post('/submit-document',   [ResidentDocumentController::class, 'storeRequest']);
  
Route::get('/request-history',  [ResidentDocumentController::class,'getHistory']); // Add this
 
  Route::post('/request-document', [DocumentRequestController::class, 'store']);


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
        Route::get('/zone-leader/logs', [ZoneLeaderController::class, 'zoneLeaderPersonalLogs']);
    Route::get('/zone-leader/residents', [ZoneLeaderController::class, 'getZoneResidents']);
    Route::post('/zone-leader/residents/{id}/verify', [ZoneLeaderController::class, 'verifyResident']);
    Route::post('/zone-leader/residents/{id}/reject', [ZoneLeaderController::class, 'rejectResident']);



    Route::prefix('clerk/requests')->group(function () {

        // GET  /api/clerk/requests/pending      → queue list
        Route::get('/pending', [ClerkController::class, 'getPending']);

        // GET  /api/clerk/requests/{id}         → single request detail
        Route::get('/{id}', [ClerkController::class, 'show']);

        // POST /api/clerk/requests/{id}/approve → approve or mark ready
        Route::post('/{id}/approve', [ClerkController::class, 'approve']);

        // POST /api/clerk/requests/{id}/reject  → reject with reason
        Route::post('/{id}/reject', [ClerkController::class, 'reject']);

        // POST /api/clerk/requests/process-scheduled
        // (Typically called by a scheduler, but exposed here for manual trigger / testing)
        Route::post('/process-scheduled', [ClerkController::class, 'processScheduled']);
    });

    Route::get('/clerk/template', [ClerkController::class, 'serveTemplate']);

});



     Route::post('/logout', [AuthController::class, 'logout']);




Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/genders', [GenderController::class, 'index']);
 Route::get('/zones', [ZoneController::class, 'index']);
Route::get('/civil-status', [CivilStatusController::class, 'index']);
