<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentRequest;

class DocumentRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purpose' => 'required|string',
            'status_id' => 'required|exists:request_statuses,status_id',
            'document_items' => 'required|array',
            'document_items.*.document_id' => 'required|exists:document_types,document_id',
            'document_items.*.quantity' => 'required|integer|min:1',
        ]);

        // Get the resident relationship from the authenticated user
        $resident = auth()->user()->resident; // Access the relationship
        
        if (!$resident) {
            return response()->json(['message' => 'User is not linked to a resident'], 400);
        }

        $docRequest = DocumentRequest::create([
            'resident_id' => $resident->resident_id, // Use the relationship's resident_id
            'status_id' => $validated['status_id'],
            'purpose' => $validated['purpose'],
            'request_date' => now(),
        ]);

        foreach ($validated['document_items'] as $item) {
            $docRequest->items()->create([
                'document_id' => $item['document_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return response()->json([
            'message' => 'Request created successfully',
            'request' => $docRequest
        ], 201);
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

// app/Http/Controllers/DocumentRequestController.php

// app/Http/Controllers/DocumentRequestController.php

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

