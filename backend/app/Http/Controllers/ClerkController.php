<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ClerkController extends Controller
{
    /**
     * Centralized eager-load chain.
     *
     * Zone lives on User, not Resident:
     *   DocumentRequest → resident → user → zone
     *                             → gender
     *                             → civilStatus
     */
    private function baseQuery()
    {
        return DocumentRequest::with([
            'resident.user.zone',   // zone_id is on users table
            'resident.gender',
            'resident.civilStatus',
            'documentType',
            'status',
        ]);
    }

    /**
     * GET /api/clerk/requests/pending
     */
    public function getPending()
    {
        $requests = $this->baseQuery()
            ->where('status_id', 1)
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json($requests);
    }

    /**
     * GET /api/clerk/requests/{id}
     */
    public function show($id)
    {
        $request = $this->baseQuery()
            ->with(['formData.fieldDefinition'])
            ->findOrFail($id);

        return response()->json($request);
    }

    /**
     * POST /api/clerk/requests/{id}/approve
     *
     * pickup_date absent/null → Ready for Pickup (status 3) today
     * pickup_date present     → Approved (status 2), auto-flips via scheduler
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'pickup_date' => 'nullable|date|after_or_equal:today',
        ]);

        $docRequest = DocumentRequest::with('documentType')->findOrFail($id);

        $hasDate     = !empty($request->pickup_date);
        $pickupDate  = $hasDate ? $request->pickup_date : Carbon::today()->toDateString();
        $newStatusId = $hasDate ? 2 : 3;
        $actionLabel = $hasDate ? 'APPROVE_REQUEST' : 'MARK_READY_FOR_PICKUP';
        $detail      = $hasDate
            ? "Approved. Pickup scheduled for {$pickupDate}."
            : "Marked Ready for Pickup immediately (today).";

        $docRequest->update([
            'status_id'       => $newStatusId,
            'pickup_date'     => $pickupDate,
            'last_updated_by' => Auth::id(),
        ]);

        ActionLog::create([
            'user_id'    => Auth::id(),
            'request_id' => $id,
            'action'     => $actionLabel,
            'details'    => $detail . ' Document: ' . $docRequest->documentType->document_name,
        ]);

        return response()->json([
            'message' => $hasDate
                ? "Request approved. Pickup set for {$pickupDate}."
                : 'Request marked as Ready for Pickup.',
            'request' => $this->baseQuery()
                ->with(['formData.fieldDefinition'])
                ->find($id),
        ]);
    }

    /**
     * POST /api/clerk/requests/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string|max:1000']);

        $docRequest = DocumentRequest::with('documentType')->findOrFail($id);

        $docRequest->update([
            'status_id'        => 4,
            'rejection_reason' => $request->reason,
            'last_updated_by'  => Auth::id(),
        ]);

        ActionLog::create([
            'user_id'    => Auth::id(),
            'request_id' => $id,
            'action'     => 'REJECT_REQUEST',
            'details'    => "Rejected. Reason: {$request->reason}. Document: {$docRequest->documentType->document_name}",
        ]);

        return response()->json([
            'message' => 'Request rejected.',
            'request' => $this->baseQuery()
                ->with(['formData.fieldDefinition'])
                ->find($id),
        ]);
    }

    /**
     * POST /api/clerk/requests/process-scheduled
     * Wire to a daily Artisan schedule to auto-flip Approved → Ready for Pickup.
     */
    public function processScheduled()
    {
        $due = DocumentRequest::where('status_id', 2)
            ->whereDate('pickup_date', '<=', Carbon::today())
            ->get();

        foreach ($due as $doc) {
            $doc->update(['status_id' => 3]);

            ActionLog::create([
                'user_id'    => null,
                'request_id' => $doc->request_id,
                'action'     => 'AUTO_READY_FOR_PICKUP',
                'details'    => 'Automatically set to Ready for Pickup on scheduled date.',
            ]);
        }

        return response()->json([
            'message'   => 'Scheduled processing complete.',
            'processed' => $due->count(),
        ]);
    }
}