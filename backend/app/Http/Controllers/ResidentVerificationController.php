<?php
namespace App\Http\Controllers;


use App\Models\Resident;
use App\Models\Inbox; // Import the Inbox model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResidentVerificationController extends Controller
{
    public function index()
    {
        // Eager load the user to show email in the frontend
        $residents = Resident::with('user')->get();
        return response()->json($residents);
    }

  
    public function approve($id)
{
    $resident = Resident::findOrFail($id);
    
    // 1. Get the user object from the Auth facade
    $currentUser = Auth::user(); 

    // 2. Safety check: ensure a user is actually logged in
    if (!$currentUser) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $resident->update([
        'is_verified' => true,
     
    ]);

    // 3. Use the user object to get the user_id
    Inbox::create([
        'sender_user_id' => $currentUser->user_id, // Accessing the custom PK
        'receiver_user_id' => $resident->user_id, 
        'title' => 'Account Verified',
        'message' => "Congratulations {$resident->first_name}!...",
        'is_read' => false,
    ]);

    return response()->json([
        'message' => 'Resident verified and notified successfully',
    ]);
}
    // Reject a resident's ID
    public function reject(Request $request, $id)
    {
        $resident = Resident::findOrFail($id);
        
        // 1. Validate the reason from the request
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        // 2. Update status to false, but do not store reason in resident table
        $resident->update([
            'is_verified' => false,
            // If you removed this column from the database, comment this line out:
            // 'rejection_reason' => null, 
        ]);

        // 3. AUTOMATED INBOX MESSAGE (Includes the reason)
        Inbox::create([
            'sender_user_id' => Auth::id(),
            'receiver_user_id' => $resident->user_id,
            'title' => 'Verification Rejected ⚠️', // Auto-generated title
            'message' => "Hi {$resident->first_name}, your account verification was rejected. Reason: " . $validated['rejection_reason'] . ". Please update your information or re-upload your ID.",
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Resident rejected and notified successfully',
            'resident' => $resident
        ]);
    }
}