<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Models\Resident;
use App\Models\Zone;
use App\Models\Gender;
use App\Models\CivilStatus;
use App\Models\ActionLog; // Import the Log model

class AdminResidentController extends Controller
{
    /**
     * Helper to record administrative actions
     */
    private function logAction($action, $details, $requestId = null)
    {
        ActionLog::create([
            'user_id'    => Auth::id(), // The Admin performing the action
            'request_id' => $requestId,
            'action'     => $action,
            'details'    => $details
        ]);
    }

    public function index()
    {
        $residents = User::with(['zone', 'resident.gender', 'resident.civilStatus'])
            ->where('role_id', 2)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return response()->json($residents);
    }

    public function meta()
    {
        return response()->json([
            'zones'          => Zone::orderBy('zone_name')->get(['zone_id', 'zone_name']),
            'genders'        => Gender::orderBy('gender_name')->get(['gender_id', 'gender_name']),
            'civil_statuses' => CivilStatus::orderBy('status_name')
                                    ->get(['civil_status_id', 'status_name as civil_status_name']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $data = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => "required|email|max:255|unique:users,email,{$id},user_id",
            'zone_id'         => 'nullable|exists:zones,zone_id',
            'gender_id'       => 'nullable|exists:genders,gender_id',
            'civil_status_id' => 'nullable|exists:civil_statuses,civil_status_id',
            'birthdate'       => 'nullable|date|before:today',
            'house_no'        => 'nullable|string|max:100',
        ]);

        $user->update([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'zone_id'    => $data['zone_id'] ?? null,
        ]);

        Resident::updateOrCreate(
            ['user_id' => $user->user_id],
            [
                'gender_id'       => $data['gender_id'] ?? null,
                'civil_status_id' => $data['civil_status_id'] ?? null,
                'birthdate'       => $data['birthdate'] ?? null,
                'house_no'        => $data['house_no'] ?? null,
            ]
        );

        // RECORD LOG
        $this->logAction(
            'Update Resident Profile', 
            "Admin updated profile for resident: {$user->first_name} {$user->last_name} (ID: {$id})"
        );

        return response()->json([
            'message' => 'Resident updated successfully.',
            'user'    => User::with(['zone', 'resident.gender', 'resident.civilStatus'])->find($id),
        ]);
    }

    public function toggleActive($id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);
        $newState = !$user->is_active;
        $user->update(['is_active' => $newState]);

        $statusText = $newState ? 'Enabled' : 'Disabled';

        // RECORD LOG
        $this->logAction(
            'Toggle Resident Status', 
            "Admin {$statusText} account for: {$user->first_name} {$user->last_name} (ID: {$id})"
        );

        return response()->json([
            'message' => $newState ? 'Account enabled.' : 'Account disabled.',
            'user'    => User::with(['zone', 'resident.gender', 'resident.civilStatus'])->find($id),
        ]);
    }

    public function updatePassword(Request $request, $id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);

        $request->validate([
            'password'              => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'password_confirmation' => 'required',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        // RECORD LOG
        $this->logAction(
            'Force Password Reset', 
            "Admin force-changed password for resident: {$user->first_name} {$user->last_name} (ID: {$id})"
        );

        return response()->json(['message' => 'Password changed successfully.']);
    }

    public function destroy($id)
    {
        $user = User::where('role_id', 2)->findOrFail($id);
        $name = "{$user->first_name} {$user->last_name}";
        
        $user->delete();

        // RECORD LOG
        $this->logAction(
            'Delete Resident', 
            "Admin permanently deleted resident record: {$name} (ID: {$id})"
        );

        return response()->json(['message' => 'Resident deleted successfully.']);
    }
}