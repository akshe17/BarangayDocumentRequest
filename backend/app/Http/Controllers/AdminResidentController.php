<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Models\Resident;
use App\Models\Zone;
use App\Models\Gender;
use App\Models\CivilStatus;

class AdminResidentController extends Controller
{
    /**
     * GET /api/admin/residents
     * All users with role_id = 2 (Resident), with full relationships.
     */
    public function index()
    {
        $residents = User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return response()->json($residents);
    }

    /**
     * GET /api/admin/residents/meta
     * Lookup tables for the edit form dropdowns — one call.
     */
    public function meta()
    {
        return response()->json([
            'zones'          => Zone::orderBy('zone_name')->get(['zone_id', 'zone_name']),
            'genders'        => Gender::orderBy('gender_name')->get(['gender_id', 'gender_name']),
            'civil_statuses' => CivilStatus::orderBy('status_name')->get(['civil_status_id', 'status_name']),
        ]);
    }

    /**
     * GET /api/admin/residents/{id}
     * Single resident user — for edit page load.
     */
    public function show($id)
    {
        $user = User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2)
            ->findOrFail($id);

        return response()->json($user);
    }

    /**
     * PATCH /api/admin/residents/{id}
     * Update both the User record (name, email, zone, is_active)
     * and the linked Resident record (gender, civil status, birthdate,
     * house_no, is_verified).
     *
     * Uses updateOrCreate so it works even if the resident row
     * doesn't exist yet.
     */
    public function update(Request $request, $id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $data = $request->validate([
            // User fields
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => "required|email|max:255|unique:users,email,{$id},user_id",
            'zone_id'         => 'nullable|exists:zones,zone_id',
            'is_active'       => 'required|boolean',

            // Resident fields
            'gender_id'       => 'nullable|exists:genders,gender_id',
            'civil_status_id' => 'nullable|exists:civil_statuses,civil_status_id',
            'birthdate'       => 'nullable|date|before:today',
            'house_no'        => 'nullable|string|max:100',
            'is_verified'     => 'required|boolean',
        ]);

        // ── Update User ──────────────────────────────────────────
        $user->update([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'zone_id'    => $data['zone_id']   ?? null,
            'is_active'  => $data['is_active'],
        ]);

        // ── Update or create Resident ────────────────────────────
        Resident::updateOrCreate(
            ['user_id' => $user->user_id],
            [
                'gender_id'       => $data['gender_id']       ?? null,
                'civil_status_id' => $data['civil_status_id'] ?? null,
                'birthdate'       => $data['birthdate']        ?? null,
                'house_no'        => $data['house_no']         ?? null,
                'is_verified'     => $data['is_verified'],
            ]
        );

        return response()->json([
            'message' => 'Resident updated successfully.',
            'user'    => User::with(['zone', 'resident.gender', 'resident.civilStatus'])
                            ->find($id),
        ]);
    }

    /**
     * PATCH /api/admin/residents/{id}/password
     * Admin force-sets a new password. No current password needed.
     */
    public function updatePassword(Request $request, $id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $request->validate([
            'password'              => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'password_confirmation' => 'required',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * DELETE /api/admin/residents/{id}
     * Deletes the User (cascades to Resident via FK).
     */
    public function destroy($id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Resident deleted successfully.']);
    }
}