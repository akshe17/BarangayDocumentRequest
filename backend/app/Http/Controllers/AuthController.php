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
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\ActionLog;
class AuthController extends Controller
{
  
   public function login(Request $request)
{
   // Basic validation for login
   $request->validate([
       'email' => 'required|email',
       'password' => 'required',
   ]);

   // Optional hCaptcha verification: only if a token is provided (e.g. web app)
   $hcaptchaResponse = $request->input('h_captcha_token');
   if ($hcaptchaResponse) {
       $secret = config('services.hcaptcha.secret');

       if (empty($secret)) {
           Log::error('hCaptcha secret key is not configured (login). Skipping captcha verification.');
       } else {
           $verify = Http::asForm()->post('https://hcaptcha.com/siteverify', [
               'secret' => $secret,
               'response' => $hcaptchaResponse,
               'remoteip' => $request->ip(),
           ]);

           $verifyBody = $verify->json();
           Log::info('hCaptcha verification response (login)', ['body' => $verifyBody]);

           if (!($verifyBody['success'] ?? false)) {
               return response()->json([
                   'success' => false,
                   'message' => 'hCaptcha verification failed.',
                   'debug' => [
                       'error_codes' => $verifyBody['error-codes'] ?? null,
                       'hostname' => $verifyBody['hostname'] ?? null,
                   ],
               ], 422);
           }
       }
   }

   $credentials = $request->only(['email', 'password']);

    // 1. Initial attempt to authenticate
    if (!auth()->attempt($credentials)) {
        return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
    }

    $user = auth()->user();

    // 2. CHECK IS_ACTIVE: If false, logout and throw error
    if (!$user->is_active) {
        auth()->logout(); // Important: terminate the session we just started
        return response()->json([
            'success' => false,
            'message' => 'Your account is deactivated. Please contact the administrator.'
        ], 403);
    }

    // Load relationships
    $user->load('resident.zone', 'resident');
    
    // 3. Resident-specific verification checks (Role 2)
    if ((int)$user->role_id === 2) {
        $resident = $user->resident;

        if ($resident) {
            $verification = $resident->is_verified;

            // Treat 0 / "0" / false as REJECTED
            if ($verification === 0 || $verification === '0' || $verification === false) {
                auth()->logout();
                return response()->json([
                    'success' => false,
                    'status' => 'rejected',
                    'message' => 'Your account registration was rejected.',
                    'user_id' => $user->user_id
                ], 403);
            }

            // Treat NULL as PENDING
            if (is_null($verification)) {
                auth()->logout();
                return response()->json([
                    'success' => false,
                    'status' => 'pending_verification',
                    'message' => 'Your account is awaiting verification.',
                    'email' => $user->email,
                    'user_id' => $user->user_id
                ], 403);
            }
        }
    }

    // Token Generation
    $user->tokens()->delete();
    $token = $user->createToken('auth_token')->plainTextToken;

    // Prepare response data
    $userData = $user->toArray();
    
    // Add zone name from resident's zone
    if ($user->resident && $user->resident->zone) {
        $userData['zone_name'] = $user->resident->zone->zone_name;
    } else {
        $userData['zone_name'] = null;
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
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|min:6',
            'fname'           => 'required|string|max:255',
            'mname'           => 'nullable|string|max:255',
            'lname'           => 'required|string|max:255',
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

    // Optional hCaptcha verification for registration (e.g. web app)
    $hcaptchaResponse = $request->input('h_captcha_token');
    if ($hcaptchaResponse) {
        $secret = config('services.hcaptcha.secret');

        if (empty($secret)) {
            Log::error('hCaptcha secret key is not configured (register). Skipping captcha verification.');
        } else {
            $verify = Http::asForm()->post('https://hcaptcha.com/siteverify', [
                'secret' => $secret,
                'response' => $hcaptchaResponse,
                'remoteip' => $request->ip(),
            ]);

            $verifyBody = $verify->json();
            Log::info('hCaptcha verification response (register)', ['body' => $verifyBody]);

            if (!($verifyBody['success'] ?? false)) {
                return response()->json([
                    'message' => 'hCaptcha verification failed.',
                    'errors' => [
                        'captcha' => $verifyBody['error-codes'] ?? ['unknown_captcha_error'],
                    ],
                ], 422);
            }
        }
    }

   try {
        // Collect data needed for email AFTER the transaction commits
        $mailData = DB::transaction(function () use ($request) {

            $path = $request->file('id_image')->store('verification_ids', 'public');

            // 1. Create user
            $user = User::create([
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'role_id'     => 2,
                'first_name'  => $request->fname,
                'middle_name' => $request->mname ?? null,
                'last_name'   => $request->lname,
                'is_active'   => true,
            ]);

            // 2. Create resident
            $resident = Resident::create([
                'user_id'         => $user->user_id,
                'zone_id'         => $request->zone,
                'birthdate'       => $request->birthdate,
                'house_no'        => $request->house_no,
                'gender_id'       => $request->gender_id,
                'civil_status_id' => $request->civil_status_id,
                'id_image_path'   => $path,
                'is_verified'     => null,
            ]);

            // Find Zone Leaders to notify
            $zoneLeaders = User::where('role_id', 4)
                               ->whereHas('zoneLeader', fn($q) => $q->where('zone_id', $resident->zone_id))
                               ->get();

            // Action logs (DB — safe inside transaction)
            foreach ($zoneLeaders as $leader) {
                ActionLog::create([
                    'user_id'    => $leader->user_id,
                    'request_id' => null,
                    'action'     => 'New Registration',
                    'details'    => "New resident registration received from: {$user->first_name} {$user->last_name} in Zone {$resident->zone_id}.",
                ]);
            }

            // Return data needed for email — do NOT send mail inside transaction
            return [
                'user'        => $user,
                'resident'    => $resident,
                'zoneLeaders' => $zoneLeaders,
            ];
        });

        // --- EMAIL LOGIC (outside transaction so mail errors don't rollback DB) ---
        $user        = $mailData['user'];
        $resident    = $mailData['resident'];
        $zoneLeaders = $mailData['zoneLeaders'];

        Log::info("Looking for zone leaders in zone: {$resident->zone_id}");
        Log::info("Found " . $zoneLeaders->count() . " zone leaders");

        if ($zoneLeaders->isEmpty()) {
            Log::warning("No zone leaders found for zone_id: {$resident->zone_id}");
        }

        foreach ($zoneLeaders as $leader) {
            try {
                Mail::to($leader->email)
                    ->send(new ZoneLeaderNotificationMail($user, $leader));

                Log::info("Zone leader notification sent to: {$leader->email}");
            } catch (\Exception $e) {
                // Log and continue — mail failure must never block registration
                Log::error("Failed to send zone leader email to {$leader->email}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Registration successful! Please wait for account verification.',
            'email'   => $user->email,
            'status'  => 'pending_verification',
            'note'    => 'We will send you an email once your account has been verified. You will be able to login after verification is complete.',
        ], 201);
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
 public function updateName(Request $request)
    {
        $request->validate([
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
        ]);

        $user = $request->user();
        $user->update([
            'first_name'  => $request->first_name,
            'middle_name' => $request->middle_name ?? null,
            'last_name'   => $request->last_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Name updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Update the authenticated user's email address.
     * Route: POST /auth/update-email
     */
    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->user_id . ',user_id',
        ], [
            'email.unique' => 'This email is already in use by another account.',
        ]);

        $user->update(['email' => $request->email]);

        return response()->json([
            'success' => true,
            'message' => 'Email updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Change the authenticated user's password.
     * Route: POST /auth/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPassword' => 'required',
            'newPassword'     => 'required|min:6',
        ], [
            'newPassword.min' => 'New password must be at least 6 characters.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->newPassword),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}