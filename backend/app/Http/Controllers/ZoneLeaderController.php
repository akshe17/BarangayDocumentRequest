<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResidentVerified;
use App\Mail\ResidentRejected;

class ZoneLeaderController extends Controller
{
    // 1. Fetch residents only for the authenticated zone leader's zone
    public function getZoneResidents()
    {
        $zoneLeader = Auth::user();

        if ($zoneLeader->role_id !== 4) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Fetch users (Residents) in the same zone
        $users = User::with(['resident'])
            ->where('zone_id', $zoneLeader->zone_id)
            ->where('role_id', 2) // Assuming 5 is Resident role
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform data: is_active is now a direct property of $user
        return response()->json($users->map(function ($user) {
            return [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'is_active' => $user->is_active, // Moved from resident
                'resident_id' => $user->resident->resident_id ?? null,
                'is_verified' => $user->resident->is_verified ?? null,
                'id_image_path' => $user->resident->id_image_path ?? null,
                'created_at' => $user->created_at,
            ];
        }));
    }

    // 2. Verify a resident
    public function verifyResident($residentId)
    {
        $zoneLeader = Auth::user();

        // Find resident and load user
        $resident = Resident::where('resident_id', $residentId)
            ->with('user')
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        // UPDATE: Update resident verification AND user activity
        $resident->update([
            'is_verified' => true,
            'verified_by' => $zoneLeader->user_id 
        ]);

        $resident->user->update([
            'is_active' => true
        ]);
        
        try {
            ActionLog::create([
                'user_id' => $zoneLeader->user_id,
                'request_id' => null,
                'action' => 'Verify Resident',
                // Updated to use user names from the user relationship
                'details' => "Verification completed by Zone Leader {$zoneLeader->last_name} for resident {$resident->user->first_name} {$resident->user->last_name}.",
            ]);
        } catch (\Exception $e) {
            Log::error('ActionLog failed for verification: ' . $e->getMessage());
        }
        
        Log::info("Zone Leader {$zoneLeader->user_id} verified resident {$residentId}");

        if ($resident->user && $resident->user->email) {
            Mail::to($resident->user->email)->send(new ResidentVerified());
        }

        return response()->json(['message' => 'Resident verified and account activated successfully']);
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

        // UPDATE: Set verified to false. You may or may not want to set is_active to false here.
        $resident->update([
            'is_verified' => false,
            'rejection_reason' => $request->rejection_reason, 
        ]);
        
        try {
            ActionLog::create([
                'user_id' => $zoneLeader->user_id,
                'request_id' => null,
                'action' => 'Reject Resident',
                'details' => "Resident {$resident->user->first_name} {$resident->user->last_name} rejected by Zone Leader {$zoneLeader->last_name}. Reason: {$request->rejection_reason}"
            ]);
        } catch (\Exception $e) {
            Log::error('ActionLog failed for rejection: ' . $e->getMessage());
        }

        Log::info("Zone Leader {$zoneLeader->user_id} rejected resident {$residentId}. Reason: {$request->rejection_reason}");

        if ($resident->user && $resident->user->email) {
            Mail::to($resident->user->email)->send(new ResidentRejected($request->rejection_reason));
        }

        return response()->json(['message' => 'Resident rejected successfully']);
    }

    public function zoneLeaderPersonalLogs()
    {
        $userId = Auth::id();

        $logs = ActionLog::with(['user', 'documentRequest'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedLogs = $logs->map(function ($log) {
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

            return [
                'id' => $log->log_id, 
                'action' => $log->action,
                'description' => $log->details,
                'type' => $type,
                // Access user name from the user relationship
                'user' => $log->user ? ($log->user->first_name . ' ' . $log->user->last_name) : 'System',
                'time' => $log->created_at->format('h:i A'),
                'date' => $log->created_at->format('M d, Y'),
            ];
        });

        return response()->json($formattedLogs);
    }

    private function getRoleName($roleId) {
        $roles = [1 => 'Admin', 4 => 'Zone Leader', 5 => 'Resident'];
        return $roles[$roleId] ?? 'Unknown';
    }
}