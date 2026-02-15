<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

    // 2. Verify a resident
    public function verifyResident($residentId)
    {
        $zoneLeader = Auth::user();

        $resident = Resident::where('resident_id', $residentId)
            ->where('zone_id', $zoneLeader->zone_id)
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => true,
            
            'verified_by' => $zoneLeader->user_id // Assuming you track who verified
        ]);

        // Optional: Send notification to resident
        
        Log::info("Zone Leader {$zoneLeader->user_id} verified resident {$residentId}");

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
            ->where('zone_id', $zoneLeader->zone_id)
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => false,
          
        ]);

        // Optional: Send notification to resident
        
        Log::info("Zone Leader {$zoneLeader->user_id} rejected resident {$residentId}. Reason: {$request->rejection_reason}");

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
}