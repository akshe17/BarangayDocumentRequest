<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
class AdminResidentController extends Controller
{
  public function index()
    {
        $residents = User::with(['role', 'zone', 'resident'])
            ->where('role_id', 2) // Assuming 2 is the Resident Role
            ->get();

        return response()->json($residents);
    }

    // PUT: Update Resident Verification (Verify/Reject)
    public function verify(Request $request, $id)
    {
        $resident = Resident::where('user_id', $id)->firstOrFail();
        
        $resident->update([
            'is_verified' => $request->status, // true or false
            'verified_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Resident status updated.']);
    }

    // DELETE: Remove Resident and User account
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // Cascades to residents table

        return response()->json(['message' => 'Resident deleted successfully.']);
    }
}
