<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
class AuthController extends Controller
{
    public function login(Request $request)
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
    if((int) $user->role_id === 2){
        $user = $user->load('resident');
    }

    return response()->json([
        'user' => $user,
        'access_token' => $token
    ]);
}
public function register(Request $request)
{
    // 1. Validate with custom error messages
    try {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'birthdate' => 'required|date|before:today',
            'house_no' => 'required|string|max:255',
            'zone' => 'required|string',
            'gender_id' => 'required|integer|exists:genders,gender_id',
            'civil_status_id' => 'required|integer|exists:civil_statuses,civil_status_id',
            'id_image' => 'required|image|mimes:jpg,jpeg,png|max:10240',
        ], [
            'email.unique' => 'This email is already registered.',
            'email.email' => 'Please provide a valid email address.',
            'password.min' => 'Password must be at least 6 characters.',
            'birthdate.before' => 'Birthdate must be in the past.',
            'gender_id.exists' => 'Please select a valid gender.',
            'civil_status_id.exists' => 'Please select a valid marital status.',
            'id_image.required' => 'Please upload a valid ID image.',
            'id_image.image' => 'The file must be an image.',
            'id_image.mimes' => 'Only JPG, JPEG, and PNG images are allowed.',
            'id_image.max' => 'Image size must not exceed 10MB.',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    }

    try {
        return DB::transaction(function () use ($request) {
            // 2. Handle File Upload
            $path = $request->file('id_image')->store('verification_ids', 'public');

            // 3. Create Resident
            $resident = Resident::create([
                'first_name' => $request->fname,
                'last_name' => $request->lname,
                'birthdate' => $request->birthdate,
                'house_no' => $request->house_no,
                'zone' => $request->zone,
                'gender_id' => $request->gender_id,
                'civil_status_id' => $request->civil_status_id,
                'id_image_path' => $path,
                'is_active' => true,
                'is_verified' => false,
            ]);

            // 4. Create User
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => 2,
            ]);

            // 5. Link them
            $resident->update(['user_id' => $user->user_id]); 
            $user->refresh();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'access_token' => $token,
                'user' => $user->load('resident'),
            ], 201);
        });
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Registration failed',
            'error' => $e->getMessage()
        ], 500);
    }
}
public function logout(Request $request)
{
    // 1. Get the plain text token from the header
    $tokenString = $request->bearerToken();

    if ($tokenString) {
        // 2. Find the token in the database
        $token = PersonalAccessToken::findToken($tokenString);

        // 3. Delete it if it exists
        if ($token) {
            $token->delete();
        }
    }

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
}