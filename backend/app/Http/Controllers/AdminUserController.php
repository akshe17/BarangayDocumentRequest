<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminUserController extends Controller
{
    // READ: Get all users with their roles
    public function index()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    // CREATE: Add new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_name' => 'required|string', // Frontend sends "Clerk", not role_id
        ]);

        // Find role_id based on name
        $role = Role::where('role_name', $validated['role_name'])->first();

        $user = User::create([
            'email' => $validated['email'],
            'password' => $validated['password'], // Hashed by model cast
            'role_id' => $role->role_id,
        ]);
        
        // Note: Your frontend formData includes 'name', but your 
        // database migration doesn't have a 'name' column. 
        // You might need to update migration to add 'name' to users.

        return response()->json($user, 201);
    }

    // UPDATE: Update user details
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'email' => 'required|string|email|max:100|unique:users,email,'.$id.',user_id',
            'role_name' => 'required|string',
        ]);

        $role = Role::where('role_name', $validated['role_name'])->first();

        $user->update([
            'email' => $validated['email'],
            'role_id' => $role->role_id,
        ]);

        return response()->json($user);
    }

    // DELETE: Remove user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
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