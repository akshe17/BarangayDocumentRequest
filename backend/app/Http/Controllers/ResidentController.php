<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\ResidentRejected;
use App\Mail\ZoneLeaderNotificationMail;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $user->loadMissing('resident');

            if (!$user->resident) {
                return response()->json(['success' => false, 'message' => 'Resident profile not found'], 404);
            }

            $primaryKey      = $user->getKeyName();
            $primaryKeyValue = $user->{$primaryKey};

            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email,' . $primaryKeyValue . ',' . $primaryKey,
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            $user->email = $request->email;
            $user->save();

            $user->refresh()->load('resident');

            return response()->json(['success' => true, 'message' => 'Email updated successfully', 'user' => $user], 200);

        } catch (\Exception $e) {
            Log::error('Profile Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update email',
                'error'   => config('app.debug') ? $e->getMessage() : 'An error occurred while updating your email',
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
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'new_password'     => [
                    'required', 'confirmed', 'min:8',
                    'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/',
                ],
            ], [
                'new_password.regex' => 'Password must contain uppercase, lowercase, and numbers',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Current password is incorrect'], 400);
            }

            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json(['success' => true, 'message' => 'Password changed successfully'], 200);

        } catch (\Exception $e) {
            Log::error('Password Change Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error'   => config('app.debug') ? $e->getMessage() : 'An error occurred while changing your password',
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
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $user->loadMissing('resident');

            if (!$user->resident) {
                return response()->json(['success' => false, 'message' => 'Resident profile not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'id_image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            $resident = $user->resident;

            // Delete old image if it exists
            if ($resident->id_image_path && Storage::exists('public/' . $resident->id_image_path)) {
                Storage::delete('public/' . $resident->id_image_path);
            }

            $path = $request->file('id_image')->store('valid_ids', 'public');

            $resident->id_image_path = $path;
            $resident->is_verified   = false;
            $resident->save();

            return response()->json([
                'success'       => true,
                'message'       => 'Valid ID uploaded successfully. Pending verification.',
                'id_image_path' => $path,
            ], 200);

        } catch (\Exception $e) {
            Log::error('ID Upload Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload ID',
                'error'   => config('app.debug') ? $e->getMessage() : 'An error occurred while uploading your ID',
            ], 500);
        }
    }

    /**
     * Resubmit ID after rejection.
     * Zone is now on residents.zone_id — zone leaders are found via zoneLeader.zone_id.
     */
    public function resubmitID(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'  => 'required|exists:users,user_id',
            'id_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user     = User::with('resident')->find($request->user_id);
        $resident = $user->resident;

        if (!$resident) {
            return response()->json(['message' => 'Resident profile not found'], 404);
        }

        if (!$request->hasFile('id_image')) {
            return response()->json(['message' => 'File upload failed'], 400);
        }

        // Delete old image
        if ($resident->id_image_path) {
            Storage::disk('public')->delete($resident->id_image_path);
        }

        $path = $request->file('id_image')->store('verification_ids', 'public');

        // Reset resident status back to pending
        $resident->update([
            'id_image_path'    => $path,
            'is_verified'      => null,      // null = pending
            'rejection_reason' => null,
        ]);

        // Also re-activate the user account so they aren't locked out while pending
        $user->update(['is_active' => true]);

        // Zone is now on residents.zone_id — find zone leaders via zoneLeader relationship
        $zoneId      = $resident->zone_id;
        $zoneLeaders = User::where('role_id', 4)
                           ->whereHas('zoneLeader', fn($q) => $q->where('zone_id', $zoneId))
                           ->get();

        // Action logs for each zone leader
        foreach ($zoneLeaders as $leader) {
            ActionLog::create([
                'user_id'    => $leader->user_id,
                'request_id' => null,
                'action'     => 'Resident ID Resubmission',
                'details'    => "Resident {$user->first_name} {$user->last_name} in Zone {$zoneId} has resubmitted their ID for review.",
            ]);
        }

        // Email notifications (outside any transaction — failure must not block resubmission)
        Log::info("Resubmission: looking for zone leaders in zone: {$zoneId}");
        Log::info("Resubmission: found " . $zoneLeaders->count() . " zone leaders");

        if ($zoneLeaders->isEmpty()) {
            Log::warning("No zone leaders found for zone_id: {$zoneId}");
        }

        foreach ($zoneLeaders as $leader) {
            try {
                Mail::to($leader->email)->send(new ZoneLeaderNotificationMail($user, $leader));
                Log::info("Zone leader resubmission notification sent to: {$leader->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send zone leader email to {$leader->email}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'New ID uploaded successfully. Awaiting zone leader review.',
        ]);
    }
}