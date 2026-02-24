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
    /* ──────────────────────────────────────────────────────────────
     | GET /api/admin/residents
     | All users with role_id = 2, with full relationships.
     ─────────────────────────────────────────────────────────────── */
    public function index()
    {
        $residents = User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return response()->json($residents);
    }

    /* ──────────────────────────────────────────────────────────────
     | GET /api/admin/residents/meta
     | Dropdown lookup tables for the edit form.
     |
     | FIX: civil_statuses now returns `civil_status_name` (was
     |      `status_name`) to match the frontend dropdown rendering:
     |        {cs.civil_status_name}
     ─────────────────────────────────────────────────────────────── */
    public function meta()
    {
        return response()->json([
            'zones'          => Zone::orderBy('zone_name')
                                    ->get(['zone_id', 'zone_name']),

            'genders'        => Gender::orderBy('gender_name')
                                    ->get(['gender_id', 'gender_name']),

            // Alias status_name → civil_status_name so the frontend
            // can render {cs.civil_status_name} without any mapping.
            'civil_statuses' => CivilStatus::orderBy('status_name')
                                    ->get(['civil_status_id', 'status_name as civil_status_name']),
        ]);
    }

    /* ──────────────────────────────────────────────────────────────
     | GET /api/admin/residents/{id}
     | Single resident — used if a direct page load is ever needed.
     ─────────────────────────────────────────────────────────────── */
    public function show($id)
    {
        $user = User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2)
            ->findOrFail($id);

        return response()->json($user);
    }

    /* ──────────────────────────────────────────────────────────────
     | PATCH /api/admin/residents/{id}
     | Details tab — updates profile fields only.
     | Sends: first_name, last_name, email, zone_id,
     |        gender_id, civil_status_id, birthdate, house_no
     |
     | is_active is handled by toggleActive().
     ─────────────────────────────────────────────────────────────── */
    public function update(Request $request, $id)
    {
        $user = User::with('resident')
            ->where('role_id', 2)
            ->findOrFail($id);

        $data = $request->validate([
            // User fields
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => "required|email|max:255|unique:users,email,{$id},user_id",
            'zone_id'    => 'nullable|exists:zones,zone_id',

            // Resident fields
            'gender_id'       => 'nullable|exists:genders,gender_id',
            'civil_status_id' => 'nullable|exists:civil_statuses,civil_status_id',
            'birthdate'       => 'nullable|date|before:today',
            'house_no'        => 'nullable|string|max:100',
        ]);

        // ── Update User row ───────────────────────────────────────
        $user->update([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'zone_id'    => $data['zone_id'] ?? null,
        ]);

        // ── Update or create Resident row ─────────────────────────
        Resident::updateOrCreate(
            ['user_id' => $user->user_id],
            [
                'gender_id'       => $data['gender_id']       ?? null,
                'civil_status_id' => $data['civil_status_id'] ?? null,
                'birthdate'       => $data['birthdate']        ?? null,
                'house_no'        => $data['house_no']         ?? null,
            ]
        );

        return response()->json([
            'message' => 'Resident updated successfully.',
            'user'    => User::with(['zone', 'resident.gender', 'resident.civilStatus'])
                             ->find($id),
        ]);
    }

    /* ──────────────────────────────────────────────────────────────
     | PATCH /api/admin/residents/{id}/toggle-active
     | Account tab — flips is_active between 0 and 1.
     | No request body needed; just toggles the current value.
     ─────────────────────────────────────────────────────────────── */
    public function toggleActive($id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $newState = !$user->is_active;
        $user->update(['is_active' => $newState]);

        return response()->json([
            'message' => $newState ? 'Account enabled.' : 'Account disabled.',
            'user'    => User::with(['zone', 'resident.gender', 'resident.civilStatus'])
                             ->find($id),
        ]);
    }

    /* ──────────────────────────────────────────────────────────────
     | PATCH /api/admin/residents/{id}/password
     | Admin force-sets a new password. No current password needed.
     |
     | Frontend sends: { password, password_confirmation }
     | Password rule: min 8 chars, mixed case, at least one number
     ─────────────────────────────────────────────────────────────── */
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

    /* ──────────────────────────────────────────────────────────────
     | DELETE /api/admin/residents/{id}
     | Deletes the User (cascades to Resident via FK).
     ─────────────────────────────────────────────────────────────── */
    public function destroy($id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Resident deleted successfully.']);
    }
}