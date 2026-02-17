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
use App\Models\ActionLog;
class AuthController extends Controller
{
   
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!auth()->attempt($credentials)) {
        return response()->json(['success' => false, 'error' => 'Invalid credentials'], 401);
    }

    // Load relationships: zone and resident
    $user = auth()->user()->load('zone', 'resident');
    
    // Assume role_id 2 is Resident
    if ((int)$user->role_id === 2) {
        $resident = $user->resident;

        if ($resident && $resident->is_verified === 0) {
            return response()->json([
                'success' => false,
                'status' => 'rejected',
                'message' => 'Your account registration was rejected.',
                'user_id' => $user->user_id
            ], 403);
        }

        if ($resident && $resident->is_verified === null) {
            return response()->json([
                'success' => false,
                'status' => 'pending_verification',
                'message' => 'Your account is awaiting verification.',
                'email' => $user->email,
                'user_id' => $user->user_id
            ], 403);
        }
    }

    // Token Generation
    $user->tokens()->delete();
    $token = $user->createToken($request->password)->plainTextToken;

    // --- CHANGE: Add 'zone_name' while keeping 'zone_id' ---
    $userData = $user->toArray();
    
    if ($user->zone) {
        $userData['zone_name'] = $user->zone->name; // Assumes 'name' field in zones table
    } else {
        $userData['zone_name'] = null; // Or a default value
    }

    return response()->json([
        'success' => true,
        'user' => $userData,
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

            // --- NEW: ACTION LOG LOGIC FOR WEBSITE NOTIFICATION ---
            // Find Zone Leaders to log the action for them
            $zoneLeaders = User::where('role_id', 4) // Assuming 4 is Zone Leader based on your original code
                               ->where('zone_id', $user->zone_id)
                               ->get();

            foreach ($zoneLeaders as $leader) {
                ActionLog::create([
                    'user_id' => $leader->user_id, // Logged for the zone leader
                    'request_id' => null, // Not a specific document request yet
                    'action' => 'New Registration',
                    'details' => "New resident registration received from: {$user->first_name} {$user->last_name} in Zone {$user->zone_id}.",
                ]);
            }
            // -----------------------------------------------------

            // --- EMAIL LOGIC ---
            // Send email to Zone Leaders in the same zone
            Log::info("Looking for zone leaders in zone: {$user->zone_id}");
            Log::info("Found " . $zoneLeaders->count() . " zone leaders");

            if ($zoneLeaders->isEmpty()) {
                Log::warning("No zone leaders found for zone_id: {$user->zone_id}");
            }

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
            ], 201);
        });
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Registration failed',
            'error' => $e->getMessage(),
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