<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use App\Models\User;
use App\Models\ActionLog;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResidentVerified;
use App\Mail\ResidentRejected;

class ZoneLeaderController extends Controller
{
    /**
     * Authorize and return the authenticated zone leader user.
     * Zone is now on zoneLeader->zone_id (not user->zone_id).
     */
    private function authorizedZoneLeader()
    {
        $user = Auth::user();

        if ((int) $user->role_id !== 4) {
            abort(response()->json(['message' => 'Unauthorized'], 403));
        }

        // Eager-load the ZoneLeader record + its zone so every method can use it
        $user->loadMissing('zoneLeader.zone');

        return $user;
    }

    /**
     * Helper: get the zone_id for the authenticated zone leader.
     */
    private function getZoneId(User $zoneLeader): int
    {
        return $zoneLeader->zoneLeader->zone_id;
    }

    // ─── 1. Fetch residents in the zone leader's zone ─────────────────────────
    public function getZoneResidents()
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        // Zone is now on residents.zone_id — filter through the resident relationship
        $users = User::with([
                'resident.gender',
                'resident.civilStatus',
                'resident.zone',        // zone lives on resident now
            ])
            ->where('role_id', 2)
            ->whereHas('resident', fn($q) => $q->where('zone_id', $zoneId))
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($users->map(function ($user) {
            $resident = $user->resident;

            return [
                // ── User fields ──────────────────────────────
                'user_id'    => $user->user_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'is_active'  => $user->is_active,
                'created_at' => $user->created_at,

                // ── Zone (from resident) ─────────────────────
                'zone' => $resident && $resident->zone ? [
                    'zone_id'   => $resident->zone->zone_id,
                    'zone_name' => $resident->zone->zone_name,
                ] : null,

                // ── Resident top-level fields ────────────────
                'resident_id'      => $resident->resident_id      ?? null,
                'is_verified'      => $resident->is_verified      ?? null,
                'id_image_path'    => $resident->id_image_path    ?? null,
                'rejection_reason' => $resident->rejection_reason ?? null,

                // ── Resident detail object ───────────────────
                'resident' => $resident ? [
                    'resident_id' => $resident->resident_id,
                    'birthdate'   => $resident->birthdate,
                    'house_no'    => $resident->house_no,
                    'zone_id'     => $resident->zone_id,
                    'gender'      => $resident->gender ? [
                        'gender_id'   => $resident->gender->gender_id,
                        'gender_name' => $resident->gender->gender_name,
                    ] : null,
                    'civil_status' => $resident->civilStatus ? [
                        'civil_status_id' => $resident->civilStatus->civil_status_id,
                        'status_name'     => $resident->civilStatus->status_name,
                    ] : null,
                ] : null,
            ];
        }));
    }

    // ─── 2. Verify a resident ─────────────────────────────────────────────────
    public function verifyResident($residentId)
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        // Zone check now via residents.zone_id
        $resident = Resident::where('resident_id', $residentId)
            ->where('zone_id', $zoneId)
            ->with('user')
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => true,
            'verified_by' => $zoneLeader->user_id,
        ]);

        $resident->user->update(['is_active' => true]);

        // Send verification email (outside any transaction — failure must not block)
        try {
            Mail::to($resident->user->email)
                ->send(new ResidentVerified($resident->user));
            Log::info("Verification email sent to: {$resident->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send verification email to {$resident->user->email}: " . $e->getMessage());
        }

        try {
            ActionLog::create([
                'user_id'    => $zoneLeader->user_id,
                'request_id' => null,
                'action'     => 'Verify Resident',
                'details'    => "Verification completed by Zone Leader {$zoneLeader->last_name} for resident {$resident->user->first_name} {$resident->user->last_name}.",
            ]);
        } catch (\Exception $e) {
            Log::error('ActionLog failed for verification: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Resident verified and account activated successfully']);
    }

    // ─── 3. Reject a resident ─────────────────────────────────────────────────
    public function rejectResident(Request $request, $residentId)
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        // Zone check now via residents.zone_id
        $resident = Resident::where('resident_id', $residentId)
            ->where('zone_id', $zoneId)
            ->with('user')
            ->first();

        if (!$resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified'      => false,
            'rejection_reason' => $request->rejection_reason,
        ]);

        // Send rejection email
        try {
            Mail::to($resident->user->email)
                ->send(new ResidentRejected($resident->user, $request->rejection_reason));
            Log::info("Rejection email sent to: {$resident->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send rejection email to {$resident->user->email}: " . $e->getMessage());
        }

        try {
            ActionLog::create([
                'user_id'    => $zoneLeader->user_id,
                'request_id' => null,
                'action'     => 'Reject Resident',
                'details'    => "Resident {$resident->user->first_name} {$resident->user->last_name} rejected by Zone Leader {$zoneLeader->last_name}. Reason: {$request->rejection_reason}",
            ]);
        } catch (\Exception $e) {
            Log::error('ActionLog failed for rejection: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Resident rejected successfully']);
    }

    // ─── 4. Zone leader personal logs ────────────────────────────────────────
    public function zoneLeaderPersonalLogs()
    {
        $userId = Auth::id();

        $logs = ActionLog::with(['user', 'documentRequest'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($log) => $this->formatLog($log));

        return response()->json($logs);
    }

    // ─── 5. Dashboard stats ───────────────────────────────────────────────────
    public function dashboardStats()
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        // Zone is now on residents.zone_id
        $residents = Resident::where('zone_id', $zoneId)
            ->with('user')
            ->get();

        $verified             = $residents->filter(fn($r) => $r->is_verified === true)->count();
        $rejected             = $residents->filter(fn($r) => $r->is_verified === false)->count();
        $pendingVerifications = $residents->filter(fn($r) => is_null($r->is_verified))->count();

        // 5 most recent pending residents
        $recentResidents = $residents
            ->filter(fn($r) => is_null($r->is_verified))
            ->sortByDesc('created_at')
            ->take(5)
            ->values()
            ->map(fn($r) => [
                'user_id'    => $r->user->user_id    ?? null,
                'first_name' => $r->user->first_name ?? '',
                'last_name'  => $r->user->last_name  ?? '',
                'email'      => $r->user->email       ?? '',
            ]);

        // 5 most recent action logs by this zone leader
        $recentLogs = ActionLog::with('user')
            ->where('user_id', $zoneLeader->user_id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($log) => $this->formatLog($log));

        // Zone name via zoneLeader relationship
        $zoneName = $zoneLeader->zoneLeader->zone->zone_name
            ?? "Zone {$zoneId}";

        return response()->json([
            'zone_name'             => $zoneName,
            'verified'              => $verified,
            'rejected'              => $rejected,
            'pending_verifications' => $pendingVerifications,
            'recent_residents'      => $recentResidents,
            'recent_logs'           => $recentLogs,
        ]);
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────
    private function formatLog(ActionLog $log): array
    {
        $actionLower = strtolower($log->action);

        $type = match (true) {
            str_contains($actionLower, 'verify')   => 'verification',
            str_contains($actionLower, 'reject')   => 'rejection',
            str_contains($actionLower, 'request')  => 'request',
            str_contains($actionLower, 'resubmit') => 'resubmission',
            default                                 => 'update',
        };

        return [
            'id'          => $log->log_id,
            'action'      => $log->action,
            'description' => $log->details,
            'type'        => $type,
            'user'        => $log->user
                ? "{$log->user->first_name} {$log->user->last_name}"
                : 'System',
            'time'        => $log->created_at->format('h:i A'),
            'date'        => $log->created_at->format('M d, Y'),
        ];
    }
}