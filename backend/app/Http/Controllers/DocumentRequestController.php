<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\RequestStatus;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DocumentRequestController extends Controller
{
    /**
     * Display a listing of document requests
     */
   public function index(Request $request)
    {
        $query = DocumentRequest::with([
            'resident.user',
            'status',
            'items.document'
        ]);

        // ... (Filtering and Searching logic remains the same) ...

        $requests = $query->orderBy('request_date', 'desc')->get();

        // Format data directly for the frontend
        return response()->json([
            'data' => $requests->map(function ($req) {
                return [
                    'id' => $req->request_id,
                    'resident' => [
                        'full_name' => $req->resident->first_name . ' ' . $req->resident->last_name,
                        'email' => $req->resident->user->email ?? 'N/A'
                    ],
                    'status' => $req->status->status_name,
                    'purpose' => $req->purpose,
                    'payment_status' => (bool) $req->payment_status, // Ensure boolean
                    // FIX: Ensure items is an array, defaulting to empty if null
                    'items' => $req->items ? $req->items->map(function ($item) {
                        return ['document_name' => $item->document->document_name ?? 'Unknown'];
                    })->toArray() : [], 
                    'dateCreated' => $req->request_date->format('M d, Y'),
                ];
            })
        ]);
    }
    // ... (Other methods) ...


    /**
     * Store a newly created document request
     */
    public function store(Request $request)
    {
        // Direct validation
        $validator = Validator::make($request->all(), [
          'resident_id' => 'required|exists:residents,resident_id',
            'purpose' => 'required|string',
            'documents' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $pendingStatus = RequestStatus::where('status_name', 'Pending')->first();

            $documentRequest = DocumentRequest::create([
                'resident_id' => $request->resident_id,
                'status_id' => $pendingStatus->status_id,
                'purpose' => $request->purpose,
                'request_date' => now(),
                'payment_status' => false, // Default to false
            ]);

            foreach ($request->documents as $documentId) {
                $documentRequest->items()->create([
                    'document_id' => $documentId,
                    'quantity' => 1,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Request created'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Toggle payment status (Boolean)
     */
    public function togglePayment($id)
    {
        $documentRequest = DocumentRequest::findOrFail($id);
        
        // Toggle boolean 0 or 1
        $documentRequest->update([
            'payment_status' => !$documentRequest->payment_status
        ]);

        return response()->json(['message' => 'Payment status updated']);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $total = DocumentRequest::count();
        
        $pending = DocumentRequest::whereHas('status', function ($q) {
            $q->where('status_name', 'Pending');
        })->count();

        $approved = DocumentRequest::whereHas('status', function ($q) {
            $q->where('status_name', 'Approved');
        })->count();

        $completed = DocumentRequest::whereHas('status', function ($q) {
            $q->where('status_name', 'Completed');
        })->count();

        $rejected = DocumentRequest::whereHas('status', function ($q) {
            $q->where('status_name', 'Rejected');
        })->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'approved' => $approved,
            'completed' => $completed,
            'rejected' => $rejected,
        ]);
    }


public function getHistory()
{
    try {
        $resident = auth()->user()->resident;
        
        if (!$resident) {
            return response()->json(['message' => 'User is not linked to a resident'], 400);
        }

        $requests = DocumentRequest::where('resident_id', $resident->resident_id)
            ->with([
                'items.document', // Load document details for each item
                'status'          // Load status details
            ])
            ->orderBy('request_date', 'desc')
            ->get();

        // Debug: Log the data to see what's being returned
        \Log::info('Request History:', ['data' => $requests->toArray()]);

        return response()->json($requests, 200);
        
    } catch (\Exception $e) {
        \Log::error('Error fetching history:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Error fetching history',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function getDashboardStats()
{
    try {
        $resident = auth()->user()->resident;
        
        if (!$resident) {
            return response()->json(['message' => 'User is not linked to a resident'], 400);
        }

        // Get all requests for the resident
        $allRequests = DocumentRequest::where('resident_id', $resident->resident_id)
            ->with('status')
            ->get();

        // Calculate Stats
        $stats = [
            'total' => $allRequests->count(),
            'pending' => $allRequests->where('status.status_name', 'pending')->count(),
            'approved' => $allRequests->where('status.status_name', 'approved')->count(),
            'completed' => $allRequests->where('status.status_name', 'completed')->count(),
            'rejected' => $allRequests->where('status.status_name', 'rejected')->count(),
        ];

        // Get recent requests (last 5)
        $recentRequests = DocumentRequest::where('resident_id', $resident->resident_id)
            ->with(['items.document', 'status'])
            ->orderBy('request_date', 'desc')
            ->limit(5) // Increased limit to show more
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_requests' => $recentRequests,
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error fetching dashboard data',
            'error' => $e->getMessage()
        ], 500);
    }
}
}