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

        // Ensure the user is a zone leader
        if ($zoneLeader->role_id !== 4) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $residents = Resident::with(['user'])
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($residents);
    }

    public function verifyResident($residentId)
    {
        $zoneLeader = Auth::user();

        $resident = Resident::where('resident_id', $residentId)
            ->with('user') // Eager load user to get email
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => true, // 1 for Verified
            'is_active' => true,
            
            'verified_by' => $zoneLeader->user_id 
        ]);
        
        Log::info("Zone Leader {$zoneLeader->user_id} verified resident {$residentId}");

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
            ->with('user') // Eager load user to get email
            ->whereHas('user', function ($query) use ($zoneLeader) {
                $query->where('zone_id', $zoneLeader->zone_id);
            })
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => false, // 0 for Rejected
            'rejection_reason' => $request->rejection_reason, 
        ]);
        
        Log::info("Zone Leader {$zoneLeader->user_id} rejected resident {$residentId}. Reason: {$request->rejection_reason}");

        // --- SEND REJECTION EMAIL ---
        if ($resident->user && $resident->user->email) {
            Mail::to($resident->user->email)->send(new ResidentRejected($request->rejection_reason));
        }
        // ----------------------------

        return response()->json(['message' => 'Resident rejected successfully']);
    }

    public function getZoneLogs()
    {
        $user = Auth::user();

        // 1. Ensure user is a Zone Leader (assuming role_id 4)
        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2. Fetch logs for the leader's zone
        // We use whereHas to check the zone_id on the user who performed the action
        $logs = ActionLog::with(['user', 'documentRequest'])
            ->whereHas('user', function($query) use ($user) {
                $query->where('zone_id', $user->zone_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // 3. Format data for the frontend component
        $formattedLogs = $logs->map(function ($log) {
            // Determine type based on action for icons/colors
            $type = 'update';
            if (str_contains(strtolower($log->action), 'verify')) $type = 'verification';
            if (str_contains(strtolower($log->action), 'reject')) $type = 'rejection';

            return [
                'id' => $log->log_id,
                'action' => $log->action,
                'description' => $log->details,
                'type' => $type,
                'user' => $log->user->name,
                'userRole' => $this->getRoleName($log->user->role_id),
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