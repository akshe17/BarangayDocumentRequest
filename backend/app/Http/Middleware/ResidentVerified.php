<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureResidentIsVerified
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // If not logged in, or not a resident, proceed (or handle as needed)
        if (!$user || (int)$user->role_id !== 2) {
            return $next($request);
        }

        $resident = $user->resident;

        // If they are rejected (is_verified === 0)
        if ($resident && $resident->is_verified === 0) {
            
            // --- THE SECURITY CHECK ---
            // Allow access ONLY to the updateId route
            if ($request->is('api/resident/resubmit-id')) {
                return $next($request);
            }

            // Block access to everything else
            return response()->json([
                'success' => false,
                'message' => 'Your account is rejected. You can only update your ID.'
            ], 403);
        }

        // If verified (1) or pending (null), let them through
        return $next($request);
    }
}