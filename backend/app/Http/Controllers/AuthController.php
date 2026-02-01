<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validate the incoming data from your React form
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'address' => 'required|string',
            'purok' => 'required|string',
            'id_image' => 'required|image|mimes:jpg,jpeg,png|max:10240', // 10MB limit
        ]);

        try {
            return DB::transaction(function () use ($request) {
                
                // 2. Handle File Upload
                $path = $request->file('id_image')->store('verification_ids', 'public');

                // 3. Create the Resident first
                $resident = Resident::create([
                    'house_no' => $request->address,
                    'street' => $request->purok,
                    'verification_id_path' => $path, // Make sure to add this to your migration!
                    // Add default values for gender_id etc. if not in form yet
                    'gender_id' => 1, 
                    'civil_status_id' => 1,
                ]);

                // 4. Create the User and link to Resident
                $user = User::create([
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'resident_id' => $resident->resident_id,
                    'role_id' => 2, // Assuming 2 is 'Resident' role
                ]);

                // 5. Update resident with user_id (since they are linked)
                $resident->update(['user_id' => $user->id]);

                // 6. Issue Token (Sanctum)
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'message' => 'Registration successful',
                    'access_token' => $token,
                    'user' => $user->load('resident'),
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed', 'error' => $e->getMessage()], 500);
        }
    }
}