<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\ActionLog;
use App\Mail\DocumentRequestStatusMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ClerkController extends Controller
{
    /**
     * Centralized eager-load chain.
     */
    private function baseQuery()
    {
        return DocumentRequest::with([
            'resident.user.zone',
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
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'pickup_date' => 'nullable|date|after_or_equal:today',
        ]);

        $docRequest = DocumentRequest::with(['documentType', 'resident.user'])->findOrFail($id);

        $hasDate     = !empty($request->pickup_date);
        $pickupDate  = $hasDate ? $request->pickup_date : Carbon::today()->toDateString();
        $newStatusId = $hasDate ? 2 : 5; // 2: Approved, 5: Ready for Pickup
        $actionLabel = $hasDate ? 'APPROVE_REQUEST' : 'MARK_READY_FOR_PICKUP';
        $statusKey   = $hasDate ? 'approved' : 'ready';
        
        $detail = $hasDate
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

        // Notify Resident via Email
        if ($docRequest->resident->user->email) {
            Mail::to($docRequest->resident->user->email)
                ->send(new DocumentRequestStatusMail($docRequest, $statusKey));
        }

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

        $docRequest = DocumentRequest::with(['documentType', 'resident.user'])->findOrFail($id);

        $docRequest->update([
            'status_id'        => 4, // 4: Rejected
            'rejection_reason' => $request->reason,
            'last_updated_by'  => Auth::id(),
        ]);

        ActionLog::create([
            'user_id'    => Auth::id(),
            'request_id' => $id,
            'action'     => 'REJECT_REQUEST',
            'details'    => "Rejected. Reason: {$request->reason}. Document: {$docRequest->documentType->document_name}",
        ]);

        // Notify Resident via Email
        if ($docRequest->resident->user->email) {
            Mail::to($docRequest->resident->user->email)
                ->send(new DocumentRequestStatusMail($docRequest, 'rejected', $request->reason));
        }

        return response()->json([
            'message' => 'Request rejected.',
            'request' => $this->baseQuery()
                ->with(['formData.fieldDefinition'])
                ->find($id),
        ]);
    }

    /**
     * Helper for PDF template serving
     */
    public function serveTemplate(Request $request)
    {
        $path = $request->query('path');
        if (!$path) return response()->json(['error' => 'No path provided.'], 400);

        $fullPath = storage_path('app/public/' . $path);
        $realPath = realpath($fullPath);
        $storagePath = realpath(storage_path('app/public'));

        if (!$realPath || !str_starts_with($realPath, $storagePath)) {
            return response()->json(['error' => 'Invalid file path.'], 403);
        }

        if (!file_exists($realPath)) {
            return response()->json(['error' => 'Template file not found.'], 404);
        }

        return response()->file($realPath, [
            'Content-Type'                => 'application/pdf',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    /**
     * Daily Scheduler logic: Approved (2) -> Ready for Pickup (5)
     */
    public function processScheduled()
    {
        $due = DocumentRequest::with(['documentType', 'resident.user'])
            ->where('status_id', 2)
            ->whereDate('pickup_date', '<=', Carbon::today())
            ->get();

        foreach ($due as $doc) {
            $doc->update(['status_id' => 5]);

            ActionLog::create([
                'user_id'    => null,
                'request_id' => $doc->request_id,
                'action'     => 'AUTO_READY_FOR_PICKUP',
                'details'    => 'Automatically set to Ready for Pickup on scheduled date.',
            ]);

            // Notify Resident via Email
            if ($doc->resident->user->email) {
                Mail::to($doc->resident->user->email)
                    ->send(new DocumentRequestStatusMail($doc, 'ready'));
            }
        }

        return response()->json([
            'message'   => 'Scheduled processing complete.',
            'processed' => $due->count(),
        ]);
    }
}