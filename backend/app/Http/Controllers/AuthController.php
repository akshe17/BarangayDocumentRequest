<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!auth()->attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Fetch the actual model instance to ensure custom PK methods are available
    $user = User::where('email', $request->email)->first();
    
    // Clean existing tokens to avoid the 'tokenable_id' conflict from orphaned sessions
    $user->tokens()->delete(); 

    // This calls the getKey() method we added to your User model
    $token = $user->createToken($request->password)->plainTextToken;

    return response()->json([
        'user' => $user,
        'access_token' => $token
    ]);
}
   public function register(Request $request)
{
    // 1. Validate ALL incoming fields from React
    $request->validate([
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:6',
        'fname' => 'required|string',
        'lname' => 'required|string',
        'birthdate' => 'required|date',
        'address' => 'required|string',
        'purok' => 'required|string',
        'gender_id' => 'required|integer',
        'civil_status_id' => 'required|integer',
        'id_image' => 'required|image|mimes:jpg,jpeg,png|max:10240',
    ]);

    try {
        return DB::transaction(function () use ($request) {
            // 2. Handle File Upload
            $path = $request->file('id_image')->store('verification_ids', 'public');

            // 3. Create Resident with REAL data from form
            $resident = Resident::create([
                'first_name' => $request->fname, // Map fname to first_name
                'last_name' => $request->lname,   // Map lname to last_name
                'birthdate' => $request->birthdate,
                'house_no' => $request->address,
                'street' => $request->purok,
                'gender_id' => $request->gender_id,
                'civil_status_id' => $request->civil_status_id,
                'id_image_path' => $path,
            ]);

       // 4. Create User first
$user = User::create([
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'role_id' => 2, // Default to resident
]);

// 5. Explicitly link them using your custom PK
$resident->update(['user_id' => $user->user_id]); 

// Force Laravel to recognize the new ID before creating the token
$user->refresh();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'access_token' => $token,
                'user' => $user->load('resident'),
            ], 201);
        });
    } catch (\Exception $e) {
        return response()->json(['message' => 'Registration failed ', 'error' => $e->getMessage()], 500);
    }
}

  public function logout(Request $request)
    {
        // Deletes ONLY the token used for this request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}