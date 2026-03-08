<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResidentVerified;
use App\Mail\ResidentRejected;
use App\Mail\DocumentRequestStatusMail;
class ZoneLeaderController extends Controller
{
    // ─── Auth guard ───────────────────────────────────────────────────────────

    /**
     * Authorize and return the authenticated zone leader user.
     * Aborts with 403 if the authenticated user is not a Zone Leader (role_id = 4).
     */
    private function authorizedZoneLeader(): User
    {
        /** @var User $user */
        $user = Auth::user();

        if ((int) $user->role_id !== 4) {
            abort(response()->json(['message' => 'Unauthorized'], 403));
        }

        // Eager-load the ZoneLeader pivot + its zone so every method can use it
        $user->loadMissing('zoneLeader.zone');

        return $user;
    }

    /**
     * Return the zone_id belonging to the authenticated zone leader.
     */
    private function getZoneId(User $zoneLeader): int
    {
        return (int) $zoneLeader->zoneLeader->zone_id;
    }

    // ─── Shared query builder ─────────────────────────────────────────────────

    /**
     * Base Eloquent query scoped to clearance (Barangay Clearance) document
     * requests that belong to residents in the given zone.
     *
     * Joins: resident → zone, user, gender, civil status; document type; status; form data.
     *
     * @param  int  $zoneId
     * @return Builder<DocumentRequest>
     */
    private function clearanceBaseQuery(int $zoneId): Builder
    {
        return DocumentRequest::with([
                'resident.user',
                'resident.zone',
                'resident.gender',
                'resident.civilStatus',
                'documentType',
                'status',
                'formData.fieldDefinition',
            ])
            // Only document types assigned to Zone Leaders (handler_role_id = 4)
            ->whereHas('documentType', fn (Builder $q) =>
                $q->where('handler_role_id', 4)->where('in_use', true)
            )
            // Only residents in this zone leader's zone
            ->whereHas('resident', fn (Builder $q) => $q->where('zone_id', $zoneId));
    }

    private function sendStatusEmail(
    DocumentRequest $docRequest,
    string          $statusType,
    User            $zoneLeader,
    ?string         $reason = null
): void {
    try {
        Mail::to($docRequest->resident->user->email)
            ->send(new DocumentRequestStatusMail(
                $docRequest,
                $statusType,
                $reason,
                $zoneLeader,
            ));
    } catch (\Exception $e) {
        Log::error("Email failed [{$statusType}] REQ-{$docRequest->request_id}: {$e->getMessage()}");
    }
}

    /**
     * Find a single request by request_id within this zone leader's scope.
     * Uses where()->firstOrFail() instead of findOrFail() because:
     *  - DocumentRequest uses custom PK 'request_id' (not 'id')
     *  - findOrFail() ignores the whereHas constraints on a scoped builder
     */
    private function findClearanceRequest(int $zoneId, int $requestId): DocumentRequest
    {
        return $this->clearanceBaseQuery($zoneId)
            ->where('request_id', $requestId)
            ->firstOrFail();
    }

    // ─── 1. Fetch residents in the zone leader's zone ─────────────────────────

    public function getZoneResidents(): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $users = User::with([
                'resident.gender',
                'resident.civilStatus',
                'resident.zone',
            ])
            ->where('role_id', 2)
            ->whereHas('resident', fn (Builder $q) => $q->where('zone_id', $zoneId))
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($users->map(function (User $user) {
            $resident = $user->resident;

            return [
                // User fields
                'user_id'    => $user->user_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'is_active'  => $user->is_active,
                'created_at' => $user->created_at,

                // Zone (from resident)
                'zone' => $resident?->zone ? [
                    'zone_id'   => $resident->zone->zone_id,
                    'zone_name' => $resident->zone->zone_name,
                ] : null,

                // Resident top-level fields
                'resident_id'      => $resident?->resident_id,
                'is_verified'      => $resident?->is_verified,
                'id_image_path'    => $resident?->id_image_path,
                'rejection_reason' => $resident?->rejection_reason,

                // Resident detail object
                'resident' => $resident ? [
                    'resident_id' => $resident->resident_id,
                    'birthdate'   => $resident->birthdate,
                    'house_no'    => $resident->house_no,
                    'zone_id'     => $resident->zone_id,
                    'gender'      => $resident->gender ? [
                        'gender_id'   => $resident->gender->gender_id,
                        'gender_name' => $resident->gender->gender_name,
                    ] : null,
                    'civil_status' => $resident->civilStatus ? [
                        'civil_status_id' => $resident->civilStatus->civil_status_id,
                        'status_name'     => $resident->civilStatus->status_name,
                    ] : null,
                ] : null,
            ];
        }));
    }

    // ─── 2. Verify a resident ─────────────────────────────────────────────────

    public function verifyResident($residentId): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $resident = Resident::where('resident_id', $residentId)
            ->where('zone_id', $zoneId)
            ->with('user')
            ->first();

        if (! $resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified' => true,
            'verified_by' => $zoneLeader->user_id,
        ]);

        $resident->user->update(['is_active' => true]);

        try {
            Mail::to($resident->user->email)
                ->send(new ResidentVerified($resident->user));
            Log::info("Verification email sent to: {$resident->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send verification email to {$resident->user->email}: {$e->getMessage()}");
        }

        $this->logAction($zoneLeader->user_id, null, 'Verify Resident',
            "Verification completed by Zone Leader {$zoneLeader->last_name} for resident {$resident->user->first_name} {$resident->user->last_name}."
        );

        return response()->json(['message' => 'Resident verified and account activated successfully']);
    }

    // ─── 3. Reject a resident ─────────────────────────────────────────────────

    public function rejectResident(Request $request, $residentId): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $resident = Resident::where('resident_id', $residentId)
            ->where('zone_id', $zoneId)
            ->with('user')
            ->first();

        if (! $resident) {
            return response()->json(['message' => 'Resident not found in your zone'], 404);
        }

        $resident->update([
            'is_verified'      => false,
            'rejection_reason' => $request->rejection_reason,
        ]);

        try {
            Mail::to($resident->user->email)
                ->send(new ResidentRejected($resident->user, $request->rejection_reason));
            Log::info("Rejection email sent to: {$resident->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send rejection email to {$resident->user->email}: {$e->getMessage()}");
        }

        $this->logAction($zoneLeader->user_id, null, 'Reject Resident',
            "Resident {$resident->user->first_name} {$resident->user->last_name} rejected by Zone Leader {$zoneLeader->last_name}. Reason: {$request->rejection_reason}"
        );

        return response()->json(['message' => 'Resident rejected successfully']);
    }

    // ─── 4. Zone leader personal logs ────────────────────────────────────────

    public function zoneLeaderPersonalLogs(): JsonResponse
    {
        $userId = Auth::id();

        $logs = ActionLog::with(['user', 'documentRequest'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ActionLog $log) => $this->formatLog($log));

        return response()->json($logs);
    }

    // ─── 5. Dashboard stats ───────────────────────────────────────────────────

    public function dashboardStats(): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $residents = Resident::where('zone_id', $zoneId)
            ->with('user')
            ->get();

        $verified             = $residents->filter(fn ($r) => $r->is_verified === true)->count();
        $rejected             = $residents->filter(fn ($r) => $r->is_verified === false)->count();
        $pendingVerifications = $residents->filter(fn ($r) => is_null($r->is_verified))->count();

        $recentResidents = $residents
            ->filter(fn ($r) => is_null($r->is_verified))
            ->sortByDesc('created_at')
            ->take(5)
            ->values()
            ->map(fn ($r) => [
                'user_id'    => $r->user->user_id    ?? null,
                'first_name' => $r->user->first_name ?? '',
                'last_name'  => $r->user->last_name  ?? '',
                'email'      => $r->user->email       ?? '',
            ]);

        $recentLogs = ActionLog::with('user')
            ->where('user_id', $zoneLeader->user_id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn (ActionLog $log) => $this->formatLog($log));

        $zoneName = $zoneLeader->zoneLeader->zone->zone_name ?? "Zone {$zoneId}";

        // ── Document request stats scoped to this zone leader's document types ──
        $allRequests = $this->clearanceBaseQuery($zoneId)->get();

        $clearanceStats = [
            'pending'          => $allRequests->where('status_id', 1)->count(),
            'approved'         => $allRequests->where('status_id', 2)->count(),
            'completed'        => $allRequests->where('status_id', 3)->count(),
            'rejected'         => $allRequests->where('status_id', 4)->count(),
            'ready_for_pickup' => $allRequests->where('status_id', 5)->count(),
            'total'            => $allRequests->count(),
        ];

        // 5 most recent requests for the dashboard preview list
        $recentRequests = $allRequests
            ->sortByDesc('request_date')
            ->take(5)
            ->values()
            ->map(fn ($req) => $this->formatRequest($req));

        return response()->json([
            'zone_name'               => $zoneName,
            'verified'                => $verified,
            'rejected'                => $rejected,
            'pending_verifications'   => $pendingVerifications,
            'pending_clearances'      => $clearanceStats['pending'],
            'clearance_stats'         => $clearanceStats,
            'recent_requests'         => $recentRequests,
            'recent_residents'        => $recentResidents,
            'recent_logs'             => $recentLogs,
        ]);
    }

    // ─── 6. Get all clearance requests for this zone ──────────────────────────
    // GET /zone-leader/clearance

    public function getClearanceRequests(): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $requests = $this->clearanceBaseQuery($zoneId)
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json($requests->map(fn ($req) => $this->formatRequest($req)));
    }

    // ─── 7. Approve (scheduled → status 2) or Ready Now (status 5) ──────────
    // POST /zone-leader/clearance/{id}/approve
    // Body: { pickup_date?: "YYYY-MM-DD" }
    //   pickup_date set   → status 2 (Approved / Scheduled)
    //   pickup_date blank → status 5 (Ready for Pickup immediately)

    public function approveClearance(Request $request, $id): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $request->validate([
            'pickup_date' => 'nullable|date|after_or_equal:today',
        ]);

        $docRequest = $this->findClearanceRequest($zoneId, (int) $id);

        if ((int) $docRequest->status_id !== 1) {
            return response()->json(['message' => 'Only pending requests can be approved.'], 422);
        }

        $hasDate   = ! empty($request->pickup_date);
        $newStatus = $hasDate ? 2 : 5;

        $statusKey = $hasDate ? 'approved' : 'ready';
$this->sendStatusEmail(
    $docRequest->fresh(['resident.user', 'documentType', 'documentType.requirements']),
    $statusKey,
    $zoneLeader,
);

        $docRequest->update([
            'status_id'       => $newStatus,
            'pickup_date'     => $hasDate ? $request->pickup_date : null,
            'last_updated_by' => $zoneLeader->user_id,
        ]);

        $message = $hasDate
            ? "Request approved and scheduled for pickup on {$request->pickup_date}."
            : 'Request marked as ready for pickup immediately.';

        $this->logAction($zoneLeader->user_id, $docRequest->request_id, 'Approve Clearance',
            "Zone Leader {$zoneLeader->last_name}: {$message}"
        );
        

        return response()->json([
            'message' => $message,
            'request' => $this->formatRequest($docRequest->fresh([
                'resident.user', 'resident.zone', 'resident.gender',
                'resident.civilStatus', 'documentType', 'status', 'formData.fieldDefinition',
            ])),
        ]);
    }

    // ─── 8. Reject a clearance request ───────────────────────────────────────
    // POST /zone-leader/clearance/{id}/reject
    // Body: { reason: string }

    public function rejectClearance(Request $request, $id): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $request->validate(['reason' => 'required|string|max:500']);

        $docRequest = $this->findClearanceRequest($zoneId, (int) $id);

        if ((int) $docRequest->status_id !== 1) {
            return response()->json(['message' => 'Only pending requests can be rejected.'], 422);
        }

        $docRequest->update([
            'status_id'        => 4,
            'rejection_reason' => $request->reason,
            'last_updated_by'  => $zoneLeader->user_id,
        ]);

        $this->logAction($zoneLeader->user_id, $docRequest->request_id, 'Reject Clearance',
            "Zone Leader {$zoneLeader->last_name} rejected REQ-" . str_pad($docRequest->request_id, 4, '0', STR_PAD_LEFT) . ". Reason: {$request->reason}"
        );

        $this->sendStatusEmail(
    $docRequest->fresh(['resident.user', 'documentType', 'documentType.requirements']),
    'rejected',
    $zoneLeader,
    $request->reason,
);

        return response()->json([
            'message' => 'Clearance request rejected.',
            'request' => $this->formatRequest($docRequest->fresh([
                'resident.user', 'resident.zone', 'resident.gender',
                'resident.civilStatus', 'documentType', 'status', 'formData.fieldDefinition',
            ])),
        ]);
    }

    // ─── 9. Approved → Ready for Pickup (manual advance) ─────────────────────
    // POST /zone-leader/clearance/{id}/ready

    public function markReady($id): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $docRequest = $this->findClearanceRequest($zoneId, (int) $id);

        if ((int) $docRequest->status_id !== 2) {
            return response()->json(['message' => 'Request is not in Approved status.'], 422);
        }

        $docRequest->update([
            'status_id'       => 5,
            'last_updated_by' => $zoneLeader->user_id,
        ]);

        $this->logAction($zoneLeader->user_id, $docRequest->request_id, 'Status Updated',
            "Zone Leader {$zoneLeader->last_name} advanced REQ-" . str_pad($docRequest->request_id, 4, '0', STR_PAD_LEFT) . " to Ready for Pickup."
        );

        $this->sendStatusEmail(
    $docRequest->fresh(['resident.user', 'documentType', 'documentType.requirements']),
    'ready',
    $zoneLeader,
);

        return response()->json([
            'message' => 'Marked as ready for pickup.',
            'request' => $this->formatRequest($docRequest->fresh([
                'resident.user', 'resident.zone', 'resident.gender',
                'resident.civilStatus', 'documentType', 'status', 'formData.fieldDefinition',
            ])),
        ]);
    }

    // ─── 10. Ready for Pickup → Completed (payment confirmed) ────────────────
    // POST /zone-leader/clearance/{id}/complete

    public function complete($id): JsonResponse
    {
        $zoneLeader = $this->authorizedZoneLeader();
        $zoneId     = $this->getZoneId($zoneLeader);

        $docRequest = $this->findClearanceRequest($zoneId, (int) $id);

        if ((int) $docRequest->status_id !== 5) {
            return response()->json(['message' => 'Request is not in Ready for Pickup status.'], 422);
        }

        $docRequest->update([
            'status_id'       => 3,
            'payment_status'  => true,
            'last_updated_by' => $zoneLeader->user_id,
        ]);

        $this->logAction($zoneLeader->user_id, $docRequest->request_id, 'Request Completed',
            "Zone Leader {$zoneLeader->last_name} confirmed payment and completed REQ-" . str_pad($docRequest->request_id, 4, '0', STR_PAD_LEFT) . "."
        );

        $this->sendStatusEmail(
    $docRequest->fresh(['resident.user', 'documentType', 'documentType.requirements']),
    'completed',
    $zoneLeader,
);

        return response()->json([
            'message' => 'Request completed. Payment confirmed.',
            'request' => $this->formatRequest($docRequest->fresh([
                'resident.user', 'resident.zone', 'resident.gender',
                'resident.civilStatus', 'documentType', 'status', 'formData.fieldDefinition',
            ])),
        ]);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Wrap ActionLog creation in a try/catch so a logging failure
     * never breaks the actual HTTP response.
     */
    private function logAction(int $userId, ?int $requestId, string $action, string $details): void
    {
        try {
            ActionLog::create([
                'user_id'    => $userId,
                'request_id' => $requestId,
                'action'     => $action,
                'details'    => $details,
            ]);
        } catch (\Exception $e) {
            Log::error("ActionLog failed [{$action}]: {$e->getMessage()}");
        }
    }

    /**
     * Serialize a DocumentRequest into the standard API shape.
     */
    private function formatRequest(DocumentRequest $req): array
    {
        $resident = $req->resident;
        $user     = $resident?->user;

        return [
            'request_id'       => $req->request_id,
            'status_id'        => $req->status_id,
            'status'           => $req->status?->status_name,
            'purpose'          => $req->purpose,
            'request_date'     => $req->request_date,
            'pickup_date'      => $req->pickup_date,
            'payment_status'   => $req->payment_status,
            'rejection_reason' => $req->rejection_reason,
            'document_type'    => $req->documentType ? [
                'document_id'     => $req->documentType->document_id,
                'document_name'   => $req->documentType->document_name,
                'fee'             => $req->documentType->fee,
                'template_path'   => $req->documentType->template_path,
                'handler_role_id' => $req->documentType->handler_role_id,
            ] : null,
            'form_data' => $req->formData->map(fn ($fd) => [
                'data_id'          => $fd->data_id,
                'field_value'      => $fd->field_value,
                'field_definition' => $fd->fieldDefinition ? [
                    'field_id'    => $fd->fieldDefinition->field_id,
                    'field_label' => $fd->fieldDefinition->field_label,
                    'field_type'  => $fd->fieldDefinition->field_type ?? null,
                ] : null,
            ])->values()->toArray(),
            'resident' => $resident ? [
                'resident_id'  => $resident->resident_id,
                'house_no'     => $resident->house_no,
                'birthdate'    => $resident->birthdate,
                'is_verified'  => $resident->is_verified,
                'zone'         => $resident->zone ? [
                    'zone_id'   => $resident->zone->zone_id,
                    'zone_name' => $resident->zone->zone_name,
                ] : null,
                'gender' => $resident->gender ? [
                    'gender_name' => $resident->gender->gender_name,
                ] : null,
                'civil_status' => $resident->civilStatus ? [
                    'status_name' => $resident->civilStatus->status_name,
                ] : null,
                'user' => $user ? [
                    'user_id'     => $user->user_id,
                    'first_name'  => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name'   => $user->last_name,
                    'email'       => $user->email,
                ] : null,
            ] : null,
        ];
    }

    /**
     * Format an ActionLog record for the JSON response.
     */
    private function formatLog(ActionLog $log): array
    {
        $actionLower = strtolower($log->action);

        $type = match (true) {
            str_contains($actionLower, 'verify')   => 'verification',
            str_contains($actionLower, 'reject')   => 'rejection',
            str_contains($actionLower, 'complete') => 'completion',
            str_contains($actionLower, 'request')  => 'request',
            str_contains($actionLower, 'resubmit') => 'resubmission',
            default                                 => 'update',
        };

        return [
            'id'          => $log->log_id,
            'action'      => $log->action,
            'description' => $log->details,
            'type'        => $type,
            'user'        => $log->user
                ? "{$log->user->first_name} {$log->user->last_name}"
                : 'System',
            'time'        => $log->created_at->format('h:i A'),
            'date'        => $log->created_at->format('M d, Y'),
        ];
    }
}