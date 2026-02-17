<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
// --- IMPORT MAIL CLASSES ---
use Illuminate\Support\Facades\Mail;
use App\Mail\ResidentVerified;
use App\Mail\ResidentRejected;
// ---------------------------

class ZoneLeaderController extends Controller
{
    // 1. Fetch residents only for the authenticated zone leader's zone
    public function getZoneResidents()
    {
        $zoneLeader = Auth::user();

        if ($zoneLeader->role_id !== 4) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // This fetches users and eager-loads their resident profile
        $users = User::with(['resident'])
            ->whereHas('resident', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform the data for the frontend
        return response()->json($users->map(function ($user) {
            return [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                // Accessing the resident relationship
                'resident_id' => $user->resident->resident_id ?? null,
                'is_verified' => $user->resident->is_verified ?? null,
                'id_image_path' => $user->resident->id_image_path ?? null,
                'created_at' => $user->created_at,
            ];
        }));
    }

    public function verifyResident($residentId)
    {
        $zoneLeader = Auth::user();

        $resident = Resident::where('resident_id', $residentId)
            ->with('user')
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => true,
            'is_active' => true,
            'verified_by' => $zoneLeader->user_id 
        ]);
        
        // --- ADD LOG ENTRY WITH TRY-CATCH ---
        try {
            ActionLog::create([
                'user_id' => $zoneLeader->user_id,
                'request_id' => null, // NULL for resident actions
                'action' => 'Verify Resident',
                'details' => "Verification completed by Zone Leader {$zoneLeader->last_name} for resident {$resident->first_name} {$resident->last_name}.",
            ]);
        } catch (\Exception $e) {
            // This will log the error to storage/logs/laravel.log
            Log::error('ActionLog failed for verification: ' . $e->getMessage());
        }
        // ---------------------
        
        // --- LOG TO FILE ---
        Log::info("Zone Leader {$zoneLeader->user_id} verified resident {$residentId}");
        // -------------------

        // --- SEND VERIFICATION EMAIL ---
        if ($resident->user && $resident->user->email) {
            Mail::to($resident->user->email)->send(new ResidentVerified());
        }
        // -------------------------------

        return response()->json(['message' => 'Resident verified successfully']);
    }

    // 3. Reject a resident
    public function rejectResident(Request $request, $residentId)
    {
        $zoneLeader = Auth::user();
        
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $resident = Resident::where('resident_id', $residentId)
            ->with('user')
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => false,
            'rejection_reason' => $request->rejection_reason, 
        ]);
        
        // --- ADD LOG ENTRY WITH TRY-CATCH ---
        try {
            ActionLog::create([
                'user_id' => $zoneLeader->user_id,
                'request_id' => null,
                'action' => 'Reject Resident',
                // --- FIX: Added 'details' key here ---
                'details' => "Resident {$resident->first_name} {$resident->last_name} rejected by Zone Leader {$zoneLeader->last_name}. Reason: {$request->rejection_reason}"
            ]);
        } catch (\Exception $e) {
            // This will log the error to storage/logs/laravel.log
            Log::error('ActionLog failed for rejection: ' . $e->getMessage());
        }
        // ---------------------

        // --- LOG TO FILE ---
        Log::info("Zone Leader {$zoneLeader->user_id} rejected resident {$residentId}. Reason: {$request->rejection_reason}");
        // -------------------

        // --- SEND REJECTION EMAIL ---
        if ($resident->user && $resident->user->email) {
            Mail::to($resident->user->email)->send(new ResidentRejected($request->rejection_reason));
        }
        // ----------------------------

        return response()->json(['message' => 'Resident rejected successfully']);
    }

    public function zoneLeaderPersonalLogs()
{
    $userId = Auth::id(); // Get currently logged-in user ID

    // 1. Fetch logs created ONLY by this user
    $logs = ActionLog::with(['user', 'documentRequest'])
        ->where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    // 2. Format data
    $formattedLogs = $logs->map(function ($log) {
        // --- TYPE MAPPING ---
        $type = 'update';
        $actionLower = strtolower($log->action);
        
        if (str_contains($actionLower, 'verify')) {
            $type = 'verification';
        } elseif (str_contains($actionLower, 'reject')) {
            $type = 'rejection';
        } elseif (str_contains($actionLower, 'request')) {
            $type = 'request';
        } elseif (str_contains($actionLower, 'resubmit')) {
            $type = 'resubmission';
        }
        // ---------------------

        return [
            'id' => $log->log_id, 
            'action' => $log->action,
            'description' => $log->details,
            'type' => $type,
            'user' => $log->user?->name ?? 'System',
            'time' => $log->created_at->format('h:i A'),
            'date' => $log->created_at->format('M d, Y'),
        ];
    });

    return response()->json($formattedLogs);
}
    // Helper function for roles (ensure this exists in your controller)
    private function getRoleName($roleId) {
        $roles = [1 => 'Admin', 4 => 'Zone Leader', 5 => 'Resident'];
        return $roles[$roleId] ?? 'Unknown';
    }
}