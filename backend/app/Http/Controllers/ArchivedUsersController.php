<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ArchivedUsersController extends Controller
{
    /**
     * GET /api/admin/archived-users
     */
    public function index(Request $request)
    {
        try {
            $query = User::with([
                'resident.zone',
                'resident.gender',
                'resident.civilStatus',   // CivilStatus model column is: status_name
                'zoneLeader.zone',
            ])->where(function ($q) {
                $q->where('is_active', false)->orWhere('is_active', 0);
            });

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name',  'like', "%{$search}%")
                      ->orWhere('email',      'like', "%{$search}%");
                });
            }

            if ($roleId = $request->query('role_id')) {
                $query->where('role_id', $roleId);
            }

            $roleNames = DB::table('roles')->pluck('role_name', 'role_id');

            $users = $query->orderBy('updated_at', 'desc')->get()->map(function ($u) use ($roleNames) {
                $roleId = (int) $u->role_id;

                $zone    = $roleId === 4 ? ($u->zoneLeader?->zone?->zone_name ?? null)
                                         : ($u->resident?->zone?->zone_name   ?? null);
                $houseNo = $roleId === 4 ? ($u->zoneLeader?->house_no ?? null)
                                         : ($u->resident?->house_no   ?? null);

                return [
                    // ── Core (all roles) ──────────────────────
                    'user_id'      => $u->user_id,
                    'first_name'   => $u->first_name  ?? '',
                    'middle_name'  => $u->middle_name ?? '',
                    'last_name'    => $u->last_name   ?? '',
                    'email'        => $u->email        ?? '',
                    'role'         => $roleNames[$u->role_id] ?? 'Unknown',
                    'role_id'      => $u->role_id,
                    'archived_at'  => $u->updated_at ? $u->updated_at->diffForHumans() : '—',
                    'created_at'   => $u->created_at  ? $u->created_at->format('M d, Y') : '—',

                    // ── Location ──────────────────────────────
                    'zone'         => $zone,
                    'house_no'     => $houseNo,

                    // ── Resident-only ─────────────────────────
                    'birthdate'    => $u->resident?->birthdate                       ?? null,
                    'gender'       => $u->resident?->gender?->gender_name            ?? null,
                    // FIX: CivilStatus model column is `status_name`, not `civil_status_name`
                    'civil_status' => $u->resident?->civilStatus?->status_name       ?? null,
                    'is_verified'  => $u->resident !== null ? (bool) $u->resident->is_verified : null,
                ];
            });

            return response()->json([
                'users' => $users,
                'total' => $users->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('ArchivedUsers index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * PATCH /api/admin/archived-users/{id}/restore
     */
    public function restore($id)
    {
        $user = User::where('user_id', $id)->firstOrFail();

        if ($user->is_active) {
            return response()->json(['message' => 'User is already active.'], 422);
        }

        $user->update(['is_active' => true]);

        try {
            ActionLog::create([
                'user_id' => Auth::id(),
                'action'  => 'Restore Archived User',
                'details' => "Restored user: {$user->first_name} {$user->last_name} ({$user->email})",
            ]);
        } catch (\Exception $e) {
            Log::warning('ActionLog failed on restore: ' . $e->getMessage());
        }

        return response()->json([
            'message' => "{$user->first_name} {$user->last_name} has been restored.",
            'user_id' => $user->user_id,
        ]);
    }
}