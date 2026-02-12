<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\RequestItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminRequestController extends Controller
{
    /**
     * Display a listing of all document requests with relationships
     * GET /api/document-requests
     */
    public function index(Request $request)
    {
        try {
            $query = DocumentRequest::with([
                'resident.user',
                'resident.gender',
                'resident.civilStatus',
                'items.document',
                'status'
            ]);

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->whereHas('status', function ($q) use ($request) {
                    $q->where('status_name', ucfirst($request->status));
                });
            }

            // Search functionality
            if ($request->has('search') && $request->search !== '') {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->whereHas('resident', function ($residentQuery) use ($searchTerm) {
                        $residentQuery->where('first_name', 'LIKE', "%{$searchTerm}%")
                            ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
                    })
                    ->orWhereHas('items.document', function ($docQuery) use ($searchTerm) {
                        $docQuery->where('document_name', 'LIKE', "%{$searchTerm}%");
                    })
                    ->orWhere('request_id', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Order by most recent first
            $requests = $query->orderBy('request_date', 'desc')->get();

            // Format the response
            $formattedRequests = $requests->map(function ($request) {
                $resident = $request->resident;
                $fullName = "{$resident->first_name} {$resident->last_name}";
                $initials = strtoupper(substr($resident->first_name, 0, 1) . substr($resident->last_name, 0, 1));

                return [
                    'id' => "REQ-" . str_pad($request->request_id, 3, '0', STR_PAD_LEFT),
                    'request_id' => $request->request_id,
                    'resident' => $fullName,
                    'email' => $resident->user->email ?? 'N/A',
                    'documents' => $request->items->map(function ($item) {
                        return $item->document->document_name;
                    })->toArray(),
                    'date' => $request->request_date->diffForHumans(),
                    'dateCreated' => $request->request_date->format('M d, Y'),
                    'status' => $request->status->status_name ?? 'Pending',
                    'purpose' => $request->purpose ?? 'No purpose provided',
                    'avatar' => $initials,
                    'paymentStatus' => $request->payment_status === 'paid' ? 'Paid' : 'Unpaid',
                    'rejectionReason' => $request->rejection_reason,
                    'pickup_date' => $request->pickup_date ? $request->pickup_date->format('M d, Y') : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedRequests,
                'message' => 'Document requests retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving document requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified document request
     * GET /api/document-requests/{id}
     */
    public function show($id)
    {
        try {
            $request = DocumentRequest::with([
                'resident.user',
                'resident.gender',
                'resident.civilStatus',
                'items.document',
                'status'
            ])->findOrFail($id);

            $resident = $request->resident;
            $fullName = "{$resident->first_name} {$resident->last_name}";
            $initials = strtoupper(substr($resident->first_name, 0, 1) . substr($resident->last_name, 0, 1));

            $formattedRequest = [
                'id' => "REQ-" . str_pad($request->request_id, 3, '0', STR_PAD_LEFT),
                'request_id' => $request->request_id,
                'resident' => $fullName,
                'email' => $resident->user->email ?? 'N/A',
                'documents' => $request->items->map(function ($item) {
                    return [
                        'name' => $item->document->document_name,
                        'quantity' => $item->quantity,
                        'fee' => $item->document->fee
                    ];
                })->toArray(),
                'date' => $request->request_date->diffForHumans(),
                'dateCreated' => $request->request_date->format('M d, Y'),
                'status' => $request->status->status_name ?? 'Pending',
                'purpose' => $request->purpose ?? 'No purpose provided',
                'avatar' => $initials,
                'paymentStatus' => $request->payment_status === 'paid' ? 'Paid' : 'Unpaid',
                'rejectionReason' => $request->rejection_reason,
                'pickup_date' => $request->pickup_date ? $request->pickup_date->format('M d, Y') : null,
                'resident_details' => [
                    'house_no' => $resident->house_no,
                    'zone' => $resident->zone,
                    'birthdate' => $resident->birthdate,
                    'gender' => $resident->gender->gender_name ?? null,
                    'civil_status' => $resident->civilStatus->status_name ?? null,
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedRequest,
                'message' => 'Document request retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving document request',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the status of a document request to "Approved"
     * PUT /api/document-requests/{id}/approve
     */
    public function approve($id)
    {
        try {
            $request = DocumentRequest::findOrFail($id);

            // Get the "Approved" status ID (assuming status_id 2 is Approved)
            // You should adjust this based on your actual status table
            $approvedStatusId = DB::table('request_statuses')
                ->where('status_name', 'Approved')
                ->value('status_id');

            if (!$approvedStatusId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approved status not found in database'
                ], 400);
            }

            $request->update([
                'status_id' => $approvedStatusId,
                'rejection_reason' => null // Clear rejection reason if any
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document request approved successfully',
                'data' => $request->fresh(['status', 'resident', 'items.document'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving document request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a document request to "Rejected"
     * PUT /api/document-requests/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'rejection_reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $documentRequest = DocumentRequest::findOrFail($id);

            // Get the "Rejected" status ID
            $rejectedStatusId = DB::table('request_statuses')
                ->where('status_name', 'Rejected')
                ->value('status_id');

            if (!$rejectedStatusId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rejected status not found in database'
                ], 400);
            }

            $documentRequest->update([
                'status_id' => $rejectedStatusId,
                'rejection_reason' => $request->rejection_reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document request rejected successfully',
                'data' => $documentRequest->fresh(['status', 'resident', 'items.document'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting document request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a document request to "Completed"
     * PUT /api/document-requests/{id}/complete
     */
    public function complete($id)
    {
        try {
            $request = DocumentRequest::findOrFail($id);

            // Get the "Completed" status ID
            $completedStatusId = DB::table('request_statuses')
                ->where('status_name', 'Completed')
                ->value('status_id');

            if (!$completedStatusId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Completed status not found in database'
                ], 400);
            }

            $request->update([
                'status_id' => $completedStatusId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document request marked as completed successfully',
                'data' => $request->fresh(['status', 'resident', 'items.document'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error completing document request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle payment status
     * PUT /api/document-requests/{id}/toggle-payment
     */
    public function togglePaymentStatus($id)
    {
        try {
            $request = DocumentRequest::findOrFail($id);

            $newPaymentStatus = $request->payment_status === 'paid' ? 'unpaid' : 'paid';
            
            $request->update([
                'payment_status' => $newPaymentStatus
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => [
                    'request_id' => $request->request_id,
                    'payment_status' => $newPaymentStatus
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for dashboard
     * GET /api/document-requests/stats
     */
    public function getStats()
    {
        try {
            $total = DocumentRequest::count();
            
            $pending = DocumentRequest::whereHas('status', function ($q) {
                $q->where('status_name', 'pending');
            })->count();
            
            $approved = DocumentRequest::whereHas('status', function ($q) {
                $q->where('status_name', 'approved');
            })->count();
            
            $completed = DocumentRequest::whereHas('status', function ($q) {
                $q->where('status_name', 'completed');
            })->count();
            
            $rejected = DocumentRequest::whereHas('status', function ($q) {
                $q->where('status_name', 'rejected');
            })->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'pending' => $pending,
                    'approved' => $approved,
                    'completed' => $completed,
                    'rejected' => $rejected
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Calculate total fee for a document request
     * GET /api/document-requests/{id}/calculate-total
     */
    public function calculateTotal($id)
    {
        try {
            $request = DocumentRequest::with('items.document')->findOrFail($id);
            
            $total = $request->items->sum(function ($item) {
                return $item->document->fee * $item->quantity;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'request_id' => $request->request_id,
                    'total' => $total,
                    'formatted_total' => '₱' . number_format($total, 2)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating total',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}