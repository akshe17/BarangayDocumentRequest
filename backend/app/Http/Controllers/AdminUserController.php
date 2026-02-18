<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminUserController extends Controller
{
    // READ: Get all users with their roles and zones
   public function index()
{
    // Added 'zone' to eager loading and filtered out role_id = 2
    $users = User::with(['role', 'zone'])
        ->whereNot('role_id', 2)
        ->get();
        
    return response()->json($users);
}

    // CREATE: Add new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_name' => 'required|string|in:Admin,Clerk,Zone Leader,Barangay Captain', // Accept role name
            'zone_id' => 'nullable|integer|exists:zones,zone_id', // Validate zone exists
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
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // Hashed by model cast
            'role_id' => $role->role_id, // Use the ID from the Role model
            'zone_id' => $zoneId,
                        'is_active' => true,
        ]);

        // Return user with loaded relationships
        return response()->json($user->load(['role', 'zone']), 201);
    }

    // UPDATE: Update user details
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:100|unique:users,email,'.$id.',user_id',
            'role_name' => 'required|string|in:Admin,Clerk,Zone Leader,Barangay Captain,Resident', // Accept role name
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
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'role_id' => $role->role_id, // Use the ID from the Role model
            'zone_id' => $zoneId,
        ]);

        return response()->json($user->load(['role', 'zone']));
    }

    // DELETE: Remove user
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
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