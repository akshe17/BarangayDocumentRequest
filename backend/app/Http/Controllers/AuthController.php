<?php

namespace App\Http\Controllers;

use App\Mail\ZoneLeaderNotificationMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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

    
    $user = User::where('email', $request->email)->first();
    
    // Check if user is a resident (role_id = 2) and needs verification
    if((int) $user->role_id === 2){
        $user->load('resident');
        
        // Check if resident account exists
        if (!$user->resident) {
            auth()->logout();
            return response()->json([
                'message' => 'Resident profile not found',
                'status' => 'error'
            ], 403);
        }
        
        // Check if resident is verified
        if (!$user->resident->is_verified) {
            auth()->logout();
            return response()->json([
                'message' => 'Account pending verification',
                'status' => 'pending_verification',
                'email' => $user->email,
                'note' => 'Your account is awaiting verification. We will notify you via email once your account has been verified.'
            ], 403);
        }
        
        // Check if resident is active
        if (!$user->resident->is_active) {
            auth()->logout();
            return response()->json([
                'message' => 'Account is inactive',
                'status' => 'inactive',
                'email' => $user->email,
                'note' => 'Your account has been deactivated. Please contact the administrator.'
            ], 403);
        }
    }
  
    $user->tokens()->delete(); 

    $token = $user->createToken($request->password)->plainTextToken;

    return response()->json([
        'user' => $user,
        'access_token' => $token
    ]);
}


public function register(Request $request)
{
    try {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'birthdate' => 'required|date|before:today',
            'house_no' => 'required|string|max:255',
            'zone' => 'required|integer|exists:zones,zone_id',
            'gender_id' => 'required|integer|exists:genders,gender_id',
            'civil_status_id' => 'required|integer|exists:civil_statuses,civil_status_id',
            'id_image' => 'required|image|mimes:jpg,jpeg,png|max:10240',
        ], [
            'email.unique' => 'This email is already registered.',
            'email.email' => 'Please provide a valid email address.',
            'password.min' => 'Password must be at least 6 characters.',
            'birthdate.before' => 'Birthdate must be in the past.',
            'zone.exists' => 'Please select a valid zone.',
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

            $path = $request->file('id_image')->store('verification_ids', 'public');

            // 1. Create user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => 2, // Assuming 2 is Resident
                'first_name' => $request->fname,
                'last_name' => $request->lname,
                'zone_id' => $request->zone,
            ]);

            // 2. Create resident
            $resident = Resident::create([
                'user_id' => $user->user_id,
                'birthdate' => $request->birthdate,
                'house_no' => $request->house_no,
                'gender_id' => $request->gender_id,
                'civil_status_id' => $request->civil_status_id,
                'id_image_path' => $path,
                'is_active' => false,
                'is_verified' => null,
            ]);

            // --- EMAIL LOGIC ---
    // B. Send email to Zone Leaders in the same zone
            // Assumes role_id 3 is 'Zone Leader'
   // ... inside your register method ...

// 1. Find Zone Leaders
$zoneLeaders = User::where('role_id', 4)
                   ->where('zone_id', $user->zone_id)
                   ->get();

Log::info("Looking for zone leaders in zone: {$user->zone_id}");
Log::info("Found " . $zoneLeaders->count() . " zone leaders");

if ($zoneLeaders->isEmpty()) {
    Log::warning("No zone leaders found for zone_id: {$user->zone_id}");
}

// 2. Send emails to Zone Leaders immediately (or with a small initial delay if needed)
foreach ($zoneLeaders as $leader) {
    try {
      
        Mail::to($leader->email)
            ->send(new ZoneLeaderNotificationMail($user, $leader));
        
        Log::info("Zone leader notification sent to: {$leader->email}");
    } catch (\Exception $e) {
        Log::error("Failed to send zone leader email to {$leader->email}: " . $e->getMessage());
    }
}


        
            return response()->json([
                'message' => 'Registration successful! Please wait for account verification.',
                'email' => $user->email,
                'status' => 'pending_verification',
                'note' => 'We will send you an email once your account has been verified. You will be able to login after verification is complete.',
                'debug' => [
                    'zone_id' => $user->zone_id,
                    'zone_leaders_found' => $zoneLeaders->count(),
                    'zone_leader_emails' => $zoneLeaders->pluck('email')->toArray()
                ]
            ], 201);
        });
    } catch (\Exception $e) {
       return response()->json([
        'message' => 'Registration failed',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], 500);
    }
}
public function logout(Request $request)
{
   
    $tokenString = $request->bearerToken();

    if ($tokenString) {
      
        $token = PersonalAccessToken::findToken($tokenString);

        if ($token) {
            $token->delete();
        }
    }

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
}