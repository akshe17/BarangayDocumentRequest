<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth; // ← was missing, caused the 500

class AdminUserController extends Controller
{
    // READ: Get all users with their roles and zones
  public function index()
{
    // Added 'zone' to eager loading, filtered out role_id 2, and excluded inactive users
    $users = User::with(['role', 'zoneLeader.zone'])
        ->whereNot('role_id', 2)
        ->where('is_active', '!=', 0)
        ->get();
        
    return response()->json($users);
}

    // CREATE: Add new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_name' => 'required|string|in:Admin,Clerk,Zone Leader,Barangay Captain',
            'zone_id' => 'nullable|integer|exists:zones,zone_id',
        ]);

        // Convert role_name to role_id
        $role = Role::where('role_name', $validated['role_name'])->first();
        if (!$role) {
            return response()->json(['message' => 'Invalid role name.'], 422);
        }

        // Handle Zone Leader logic
        $zoneId = null;
        
        if ($validated['role_name'] === 'Zone Leader') {
            if (empty($validated['zone_id'])) {
                return response()->json(['message' => 'Zone Leader requires a zone assignment.'], 422);
            }
            $zoneId = $validated['zone_id'];
        }

        $user = User::create([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'email'       => $validated['email'],
            'password'    => $validated['password'],
            'role_id'     => $role->role_id,
            'is_active'   => true,
        ]);

        // Return user with loaded relationships
        $user->load(['role', 'zoneLeader.zone']);

        // If Zone Leader, create the ZoneLeader record with zone assignment
        if ($validated['role_name'] === 'Zone Leader') {
            \App\Models\ZoneLeader::create([
                'user_id' => $user->user_id,
                'zone_id' => $zoneId,
            ]);
        }

        return response()->json($user->load(['role', 'zoneLeader.zone']), 201);
    }

    // UPDATE: Update user details
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'email' => 'required|string|email|max:100|unique:users,email,'.$id.',user_id',
            'role_name' => 'required|string|in:Admin,Clerk,Zone Leader,Barangay Captain,Resident',
            'zone_id' => 'nullable|integer|exists:zones,zone_id',
        ]);

        // Convert role_name to role_id
        $role = Role::where('role_name', $validated['role_name'])->first();
        if (!$role) {
            return response()->json(['message' => 'Invalid role name.'], 422);
        }

        // Handle Zone Leader logic
        $zoneId = null;

        if ($validated['role_name'] === 'Zone Leader') {
            if (empty($validated['zone_id'])) {
                return response()->json(['message' => 'Zone Leader requires a zone assignment.'], 422);
            }
            $zoneId = $validated['zone_id'];
        }

        $user->update([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'email'       => $validated['email'],
            'role_id'     => $role->role_id,
        ]);

        // Update or remove ZoneLeader record based on role
        if ($validated['role_name'] === 'Zone Leader') {
            \App\Models\ZoneLeader::updateOrCreate(
                ['user_id' => $user->user_id],
                ['zone_id' => $zoneId]
            );
        } else {
            // If role changed away from Zone Leader, remove the record
            \App\Models\ZoneLeader::where('user_id', $user->user_id)->delete();
        }

        return response()->json($user->load(['role', 'zoneLeader.zone']));
    }

    // DELETE: Remove user
// ARCHIVE: Deactivate a user (soft delete)
public function archive($id)
{
    try {
        $user = User::findOrFail($id);

        // Prevent admin from deactivating themselves
        if ($user->user_id === Auth::id()) {
            return response()->json(['message' => 'You cannot deactivate your own account'], 403);
        }

        $user->update(['is_active' => 0]);

        return response()->json(['message' => 'User archived successfully']);
    } catch (ModelNotFoundException $e) {
        return response()->json(['message' => 'User not found'], 404);
    }
}

    // SPECIAL: Change Password
    public function changePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}