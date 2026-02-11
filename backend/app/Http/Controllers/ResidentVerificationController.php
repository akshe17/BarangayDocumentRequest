<?php
namespace App\Http\Controllers;


use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentVerificationController extends Controller
{

public function index()
{
    // Use 'with' to include the user data (email) 
    // and return the residents
    $residents = Resident::with('user')->get();
    
    return response()->json($residents);
}
    // Approve a resident's ID
    public function approve($id)
    {
        $resident = Resident::findOrFail($id);
        
        $resident->update([
            'is_verified' => true,
            'rejection_reason' => null, // Assuming you add this column to Resident model
        ]);

        return response()->json([
            'message' => 'Resident verified successfully',
            'resident' => $resident
        ]);
    }

    // Reject a resident's ID with a reason
    public function reject(Request $request, $id)
    {
        $resident = Resident::findOrFail($id);
        
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $resident->update([
            'is_verified' => false,
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Resident rejected successfully',
            'resident' => $resident
        ]);
    }
}