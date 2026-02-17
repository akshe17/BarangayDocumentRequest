<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;

use App\Mail\ResidentRejected;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

use App\Mail\ZoneLeaderNotificationMail; 

class ResidentController extends Controller
{
    /**
     * Update resident email address (only field editable online)
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

            // Only email is editable online; all other changes require a visit to the Barangay Hall
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email,' . $primaryKeyValue . ',' . $primaryKey,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update email only
            $user->email = $request->email;
            $user->save();

            // Reload with fresh data
            $user->refresh();
            $user->load('resident');

            return response()->json([
                'success' => true,
                'message' => 'Email updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile Update Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update email',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while updating your email'
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
        'user_id' => 'required|exists:users,user_id',
        'id_image' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
    ]);

    if ($validator->fails()) {
        return response()->json(['message' => $validator->errors()->first()], 422);
    }

    // 2. Find the user and their resident profile
    $user = User::find($request->user_id);
    $resident = $user->resident; // Assumes 'resident' relationship exists on User model

    if (!$resident) {
        return response()->json(['message' => 'Resident profile not found'], 404);
    }

    if ($request->hasFile('id_image')) {
        // 3. Delete old image if it exists
        if ($resident->id_image_path) {
            Storage::disk('public')->delete($resident->id_image_path);
        }

        // 4. Store new image
        $path = $request->file('id_image')->store('verification_ids', 'public');
        
        // 5. Update database
        $resident->update([
            'id_image_path' => $path,
            // Reset status to null (Pending) so admin knows to review
            'is_active' => false,
            'is_verified' => null,
            'rejection_reason' => null
        ]);

        // --- NEW LOGIC: Notify Zone Leaders ---
        $zoneLeaders = User::where('role_id', 4) // Assuming 4 is Zone Leader
                            ->where('zone_id', $user->zone_id)
                            ->get();

        foreach ($zoneLeaders as $leader) {
            // Log to database for each leader
            ActionLog::create([
                'user_id' => $leader->user_id, // Logged for the zone leader
                'request_id' => null, 
                'action' => 'ID Resubmission',
                'details' => "Resident {$user->first_name} {$user->last_name} in Zone {$user->zone_id} has resubmitted their ID for review.",
            ]);
        }

        // --- EMAIL LOGIC ---
        Log::info("Looking for zone leaders in zone: {$user->zone_id}");
        Log::info("Found " . $zoneLeaders->count() . " zone leaders");

        if ($zoneLeaders->isEmpty()) {
            Log::warning("No zone leaders found for zone_id: {$user->zone_id}");
        }

        foreach ($zoneLeaders as $leader) {
            try {
                // Send email to Mailtrap
                Mail::to($leader->email)
                    ->send(new ZoneLeaderNotificationMail($user, $leader));
                
                Log::info("Zone leader notification sent to: {$leader->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send zone leader email to {$leader->email}: " . $e->getMessage());
            }
        }
        // -----------------------------------------------------

        return response()->json([
            'success' => true,
            'message' => 'New ID uploaded successfully. Awaiting admin review.'
        ]);
    }

    return response()->json(['message' => 'File upload failed'], 400);
}
}