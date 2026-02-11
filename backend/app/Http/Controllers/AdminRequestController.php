<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentRequest;
use App\Models\RequestStatus;
use Illuminate\Support\Facades\DB;

class AdminRequestController extends Controller
{
    // Get all requests with stats
    public function index()
    {
        try {
            $requests = DocumentRequest::with([
                'items.document',
                'status',
                'resident.user'
            ])
            ->orderBy('request_date', 'desc')
            ->get();

            // Calculate stats - FIXED: Use status_id instead of status_name
            $stats = [
                'total' => $requests->count(),
                'pending' => $requests->where('status_id', 1)->count(),
                'approved' => $requests->where('status_id', 2)->count(),
                'completed' => $requests->where('status_id', 3)->count(),
                'rejected' => $requests->where('status_id', 4)->count(),
            ];

            // Format requests for frontend
            $formattedRequests = $requests->map(function ($request) {
                $items = $request->items ?? [];
                $totalFee = $items->reduce(function ($carry, $item) {
                    return $carry + (($item->document->fee ?? 0) * $item->quantity);
                }, 0);

                return [
                    'id' => $request->request_id,
                    'request_id' => 'REQ-' . str_pad($request->request_id, 3, '0', STR_PAD_LEFT),
                    'resident' => $request->resident ? 
                        $request->resident->first_name . ' ' . $request->resident->last_name : 
                        'Unknown',
                    'email' => $request->resident->user->email ?? 'N/A',
                    'avatar' => $this->getInitials(
                        $request->resident->first_name ?? 'U',
                        $request->resident->last_name ?? 'N'
                    ),
                    'documents' => $items->map(function ($item) {
                        return $item->document->document_name ?? 'Unknown Document';
                    })->toArray(),
                    'total_amount' => $totalFee,
                    'status' => $request->status->status_name ?? 'Unknown',
                    'status_id' => $request->status_id,
                    'purpose' => $request->purpose,
                    'date' => $this->getTimeAgo($request->request_date),
                    'date_created' => $request->request_date->format('M d, Y'),
                    'payment_status' => 'Unpaid', // Add payment tracking to your DB if needed
                    'rejection_reason' => $request->rejection_reason ?? null,
                ];
            });

            return response()->json([
                'stats' => $stats,
                'requests' => $formattedRequests,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Admin Requests Error:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Error fetching requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update request status
    public function updateStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status_id' => 'required|integer|in:1,2,3,4',
                'rejection_reason' => 'nullable|string|max:500'
            ]);

            $documentRequest = DocumentRequest::findOrFail($id);
            
            // Validate status transitions
            $currentStatusId = $documentRequest->status_id;
            $newStatusId = $validated['status_id'];
            
            // Business rules:
            // - Pending (1) can go to Approved (2) or Rejected (4)
            // - Approved (2) can go to Completed (3) only
            // - Completed (3) and Rejected (4) are final states
            
            if ($currentStatusId == 3 || $currentStatusId == 4) {
                return response()->json([
                    'message' => 'Cannot update a completed or rejected request'
                ], 400);
            }
            
            if ($currentStatusId == 1) {
                // Pending can only go to Approved or Rejected
                if (!in_array($newStatusId, [2, 4])) {
                    return response()->json([
                        'message' => 'Invalid status transition from Pending'
                    ], 400);
                }
            }
            
            if ($currentStatusId == 2) {
                // Approved can only go to Completed
                if ($newStatusId != 3) {
                    return response()->json([
                        'message' => 'Approved requests can only be marked as completed'
                    ], 400);
                }
            }

            $documentRequest->status_id = $newStatusId;
            
            // If rejected, save rejection reason
            if ($newStatusId == 4 && isset($validated['rejection_reason'])) {
                $documentRequest->rejection_reason = $validated['rejection_reason'];
            } else {
                // Clear rejection reason if not rejecting
                $documentRequest->rejection_reason = null;
            }
            
            $documentRequest->save();

            return response()->json([
                'message' => 'Status updated successfully',
                'request' => $documentRequest->load(['status', 'items.document', 'resident.user'])
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Update Status Error:', [
                'error' => $e->getMessage(),
                'request_id' => $id
            ]);
            
            return response()->json([
                'message' => 'Error updating status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper function to get initials
    private function getInitials($firstName, $lastName)
    {
        return strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
    }

    // Helper function to get time ago
    private function getTimeAgo($date)
    {
        $now = now();
        $diff = $now->diffInMinutes($date);

        if ($diff < 1) return 'Just now';
        if ($diff < 60) return $diff . ' min' . ($diff > 1 ? 's' : '') . ' ago';
        if ($diff < 1440) return floor($diff / 60) . ' hour' . (floor($diff / 60) > 1 ? 's' : '') . ' ago';
        if ($diff < 10080) return floor($diff / 1440) . ' day' . (floor($diff / 1440) > 1 ? 's' : '') . ' ago';
        return $date->format('M d, Y');
    }
}