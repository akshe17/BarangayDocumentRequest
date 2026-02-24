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
    /* ── Shared eager-load ─────────────────────────────────── */
    private function baseQuery()
    {
        return User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2);
    }

    /* ─────────────────────────────────────────────────────────
     * GET /api/admin/residents
     * All resident users (both active and inactive).
     * Frontend splits them by is_active client-side.
     * ───────────────────────────────────────────────────────── */
    public function index()
    {
        return response()->json(
            $this->baseQuery()
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get()
        );
    }

    /* ─────────────────────────────────────────────────────────
     * GET /api/admin/residents/meta
     * Lookup tables for dropdowns — one call.
     * MUST be registered BEFORE /{id} in routes.
     * ───────────────────────────────────────────────────────── */
    public function meta()
    {
        return response()->json([
            'zones'          => Zone::orderBy('zone_name')->get(['zone_id', 'zone_name']),
            'genders'        => Gender::orderBy('gender_name')->get(['gender_id', 'gender_name']),
            'civil_statuses' => CivilStatus::orderBy('status_name')->get(['civil_status_id', 'status_name']),
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     * GET /api/admin/residents/{id}
     * Single resident — edit page initial load.
     * ───────────────────────────────────────────────────────── */
    public function show($id)
    {
        return response()->json(
            $this->baseQuery()->findOrFail($id)
        );
    }

    /* ─────────────────────────────────────────────────────────
     * PATCH /api/admin/residents/{id}
     * Update User + Resident records together.
     * ───────────────────────────────────────────────────────── */
    public function update(Request $request, $id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $data = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => "required|email|max:255|unique:users,email,{$id},user_id",
            'zone_id'         => 'nullable|exists:zones,zone_id',
            'is_active'       => 'required|boolean',
            'gender_id'       => 'nullable|exists:genders,gender_id',
            'civil_status_id' => 'nullable|exists:civil_statuses,civil_status_id',
            'birthdate'       => 'nullable|date|before:today',
            'house_no'        => 'nullable|string|max:100',
            'is_verified'     => 'required|boolean',
        ]);

        $user->update([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'zone_id'    => $data['zone_id']  ?? null,
            'is_active'  => $data['is_active'],
        ]);

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
            'user'    => $this->baseQuery()->find($id),
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     * PATCH /api/admin/residents/{id}/toggle-active
     * Disable (is_active = false) or reactivate (is_active = true).
     * Body: { is_active: true|false }
     * ───────────────────────────────────────────────────────── */
    public function toggleActive(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::where('role_id', 2)->findOrFail($id);
        $user->update(['is_active' => $request->boolean('is_active')]);

        $state = $user->is_active ? 'reactivated' : 'disabled';

        return response()->json([
            'message'   => "Account {$state} successfully.",
            'is_active' => $user->is_active,
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     * PATCH /api/admin/residents/{id}/password
     * Admin force-sets a new password.
     * ───────────────────────────────────────────────────────── */
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
}