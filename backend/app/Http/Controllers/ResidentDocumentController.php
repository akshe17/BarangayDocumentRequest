<?php
namespace App\Http\Controllers;

use App\Models\DocumentType;
use App\Models\DocumentRequest;
use App\Models\RequestFormData;
use App\Models\RequestStatus;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
class ResidentDocumentController extends Controller
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
        try {
            $user = Auth::user();
            if (!$user || !$user->resident) {
                return response()->json(['message' => 'Resident profile not found.'], 404);
            }

            $history = DocumentRequest::where('resident_id', $user->resident->resident_id)
                ->with(['status', 'documentType'])
                ->orderBy('request_date', 'desc')
                ->get();

            return response()->json($history, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // In a Controller (e.g., ActionLogController)
public function getResidentLogs() {
    return ActionLog::where('user_id', auth()->id())
        ->orderBy('created_at', 'desc')
        ->get();
}
public function getResidentDashboard()
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->resident) {
                return response()->json(['message' => 'Resident profile not found.'], 404);
            }

            $residentId = $user->resident->resident_id;

            // Aggregate Stats - Includes the new status ID 5
            $stats = DocumentRequest::where('resident_id', $residentId)
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status_id = 4 THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status_id = 5 THEN 1 ELSE 0 END) as ready
                ")
                ->first();

            // Fetch 5 Most Recent Requests with correct relationships
            $recentRequests = DocumentRequest::with(['status', 'documentType'])
                ->where('resident_id', $residentId)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'stats' => [
                    'total'     => (int)($stats->total ?? 0),
                    'pending'   => (int)($stats->pending ?? 0),
                    'approved'  => (int)($stats->approved ?? 0),
                    'completed' => (int)($stats->completed ?? 0),
                    'rejected'  => (int)($stats->rejected ?? 0),
                    'ready'     => (int)($stats->ready ?? 0),
                ],
                'recent_requests' => $recentRequests
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }
}