<?php
namespace App\Http\Controllers;

use App\Models\DocumentType;
use App\Models\DocumentRequest;
use App\Models\RequestFormData;
use App\Models\RequestStatus;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    /**
     * GET /documents
     */
    public function index()
    {
        return DocumentType::where('in_use', true)
            ->with(['requirements', 'formFields'])
            ->get();
    }

    /**
     * GET /current-request
     */
    public function residentCurrentRequest()
{
    $user = auth()->user();

    return DocumentRequest::where('resident_id', $user->resident->resident_id)
        ->with(['status', 'documentType', 'formData.fieldDefinition'])  // ✅ correct place
        ->orderBy('created_at', 'desc')
        ->get();
}

    /**
     * POST /request-document
     */
     public function storeRequest(Request $request)
    {
      $user = auth()->user();

    // ── Guard ──────────────────────────────────────────────────────────
    if (!$user || !$user->resident) {
        return response()->json(['message' => 'Resident profile not found.'], 404);
    }
        $validated = $request->validate([
            'document_id' => 'required|integer|exists:document_types,document_id',
            'purpose'     => 'required|string|max:1000',
        ]);

        $formData = is_array($request->input('form_data')) ? $request->input('form_data') : [];

        $docType = DocumentType::where('document_id', $validated['document_id'])
            ->where('in_use', true)
            ->first();

        if (!$docType) {
            return response()->json(['message' => 'Document not found or no longer available.'], 404);
        }

        $alreadyActive = DocumentRequest::where('resident_id', $user->resident->resident_id)
            ->where('document_id', $docType->document_id)
            ->whereHas('status', function ($q) {
                $q->whereIn(DB::raw('LOWER(status_name)'), ['pending',  'approved', 'ready for pickup', ]);
            })
            ->exists();

        if ($alreadyActive) {
            return response()->json(['message' => 'You already have an active request for this document.'], 422);
        }

        $pendingStatus = RequestStatus::whereRaw('LOWER(status_name) = ?', ['pending'])->first();

        if (!$pendingStatus) {
            return response()->json(['message' => 'Server misconfiguration: pending status not found.'], 500);
        }

        return DB::transaction(function () use ($validated, $formData, $user, $docType, $pendingStatus) {

            $docRequest = DocumentRequest::create([
                'resident_id'    => $user->resident->resident_id,
                'document_id'    => $docType->document_id,
                'status_id'      => $pendingStatus->status_id,
                'purpose'        => $validated['purpose'],
                'request_date'   => now(),
                'payment_status' => false,
            ]);

            if (!empty($formData)) {
                $validFieldIds = $docType->formFields()->pluck('field_id')->toArray();
                foreach ($formData as $entry) {
                    $fieldId = (int) ($entry['field_id'] ?? 0);
                    if (!in_array($fieldId, $validFieldIds)) continue;
                    RequestFormData::create([
                        'request_id'  => $docRequest->request_id,
                        'field_id'    => $fieldId,
                        'field_value' => $entry['field_value'] ?? '',
                    ]);
                }
            }

            ActionLog::create([
                'user_id'    => $user->user_id,
                'request_id' => $docRequest->request_id,
                'action'     => 'submitted_request',
                'details'    => "Submitted request for: {$docType->document_name} (Request ID: {$docRequest->request_id})",
            ]);

            return response()->json(
                $docRequest->load(['status', 'documentType', 'formData.fieldDefinition']),
                201
            );
        });
    }

    public function getHistory()
{
    $user = auth()->user();

    // 1. Safety check for resident profile
    if (!$user || !$user->resident) {
        return response()->json(['message' => 'Resident profile not found.'], 404);
    }

    // 2. Fetch requests with relationships matching your 'storeRequest' load
    $history = DocumentRequest::where('resident_id', $user->resident->resident_id)
        ->with([
            'status', 
            'documentType', 
            'formData.fieldDefinition'
        ])
        ->orderBy('request_date', 'desc')
        ->get();

    // 3. Return as a clean array (React's fetchAll will handle the mapping)
    return response()->json($history, 200);
}
}