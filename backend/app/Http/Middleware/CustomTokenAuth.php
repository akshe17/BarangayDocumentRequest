<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;

class CustomTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Get the token from the Header
        $hashedToken = $request->bearerToken();

        if (!$hashedToken) {
            return response()->json(['message' => 'No token provided (Custom Auth)'], 401);
        }

        // 2. Find the token in the database
        // Sanctum tokens are stored as a hash of the plain text
        $token = PersonalAccessToken::findToken($hashedToken);

        if (!$token || ($token->expires_at && $token->expires_at->isPast())) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        // 3. Manually find the user using YOUR custom column
        $user = User::where('user_id', $token->tokenable_id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found for this token'], 404);
        }

        // 4. Log the user into the system for this request
        auth()->login($user);

        return $next($request);
    }
}