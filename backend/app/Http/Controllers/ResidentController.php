<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class ResidentController extends Controller
{
    /**
     * Update resident profile information
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Load resident relationship if not already loaded
            if (!$user->relationLoaded('resident')) {
                $user->load('resident');
            }

            if (!$user->resident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resident profile not found'
                ], 404);
            }

            // Get the primary key name dynamically
            $primaryKey = $user->getKeyName();
            $primaryKeyValue = $user->{$primaryKey};

            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $primaryKeyValue . ',' . $primaryKey,
                'house_no' => 'required|string|max:50',
                'zone' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user email
            $user->email = $request->email;
            $user->save();

            // Update resident information
            $resident = $user->resident;
            $resident->first_name = $request->first_name;
            $resident->last_name = $request->last_name;
            $resident->house_no = $request->house_no;
            $resident->zone = $request->zone;
            $resident->save();

            // Reload user with fresh data from database
            $user->refresh();
       
          $user->load('resident'); 


            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Profile Update Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while updating your profile'
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'new_password' => [
                    'required',
                    'confirmed',
                    'min:8',
                    'regex:/[a-z]/',
                    'regex:/[A-Z]/',
                    'regex:/[0-9]/',
                ],
            ], [
                'new_password.regex' => 'Password must contain uppercase, lowercase, and numbers',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if current password is correct
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Password Change Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while changing your password'
            ], 500);
        }
    }

    /**
     * Upload valid ID
     */
    public function uploadValidId(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Load resident relationship if not already loaded
            if (!$user->relationLoaded('resident')) {
                $user->load('resident');
            }

            if (!$user->resident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resident profile not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'id_image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $resident = $user->resident;

            // Delete old ID image if exists
            if ($resident->id_image_path && Storage::exists('public/' . $resident->id_image_path)) {
                Storage::delete('public/' . $resident->id_image_path);
            }

            // Store new ID image
            $path = $request->file('id_image')->store('valid_ids', 'public');
            
            // Update resident record
            $resident->id_image_path = $path;
            $resident->is_verified = false;
            $resident->save();

            return response()->json([
                'success' => true,
                'message' => 'Valid ID uploaded successfully. Pending verification.',
                'id_image_path' => $path
            ], 200);

        } catch (\Exception $e) {
            Log::error('ID Upload Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload ID',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while uploading your ID'
            ], 500);
        }
    }

 public function resubmitID(Request $request)
{
    // 1. Validate the request
    $validator = Validator::make($request->all(), [
        // --- CHANGE: Make user_id required ---
        'user_id' => 'required|exists:users,user_id', 
        'id_image' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
    ]);

    if ($validator->fails()) {
        return response()->json(['message' => $validator->errors()->first()], 422);
    }

    // 2. Find the user by the ID sent in the request
    $user = User::find($request->user_id);
    
    // Assumes a 'resident' relationship exists on the User model
    $resident = $user->resident; 

    if (!$resident) {
        return response()->json(['message' => 'Resident profile not found'], 404);
    }

    if ($request->hasFile('id_image')) {
        // 3. Delete old image if it exists
        // --- NOTE: Ensure the column name matches your DB (e.g., id_image_path) ---
        if ($resident->id_image) {
            Storage::disk('public')->delete($resident->id_image);
        }

        // 4. Store new image
        $path = $request->file('id_image')->store('verification_ids', 'public');
        
        // 5. Update database
        $resident->update([
            'id_image_path' => $path, // --- NOTE: Match your DB column name ---
            // Reset status to null (Pending) so admin knows to review
            'is_active' => false,
            'is_verified' => null, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'New ID uploaded successfully. Awaiting admin review.'
        ]);
    }

    return response()->json(['message' => 'File upload failed'], 400);
}
}