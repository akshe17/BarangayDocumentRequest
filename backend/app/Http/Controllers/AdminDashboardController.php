<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;
use App\Models\RequestStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getOverview()
    {
        try {
            // 1. Total active residents (is_active is now in User table)
            // We filter by role_id 5 (Resident) to ensure we aren't counting Admins/Staff
            $totalResidents = User::where('role_id', 2)
                ->where('is_active', 1)
                ->count();
            
            // 2. Get status IDs
            $pendingStatusId = RequestStatus::where('status_name', 'Pending')->value('status_id');
            $approvedStatusId = RequestStatus::where('status_name', 'Approved')->value('status_id');
            $completedStatusId = RequestStatus::where('status_name', 'Completed')->value('status_id');
            $rejectedStatusId = RequestStatus::where('status_name', 'Rejected')->value('status_id');
            
            // 3. Stats Calculation
            $totalRequests = DocumentRequest::count();
            $pendingRequests = DocumentRequest::where('status_id', $pendingStatusId)->count();
            $approvedRequests = DocumentRequest::where('status_id', $approvedStatusId)->count();
            $completedRequests = DocumentRequest::where('status_id', $completedStatusId)->count();
            $rejectedRequests = DocumentRequest::where('status_id', $rejectedStatusId)->count();
            
            // 4. Document type distribution (FIXED: request_items table removed)
            // We now join document_requests directly to document_types
            $documentDistribution = DB::table('document_requests')
                ->join('document_types', 'document_requests.document_id', '=', 'document_types.document_id')
                ->select(
                    'document_types.document_name as name',
                    DB::raw('COUNT(*) as value')
                )
                ->groupBy('document_types.document_id', 'document_types.document_name')
                ->orderBy('value', 'desc')
                ->limit(4)
                ->get();
            
            // 5. Trend data for the last 7 days
            $trendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $count = DocumentRequest::whereDate('created_at', $date->toDateString())->count();
                
                $trendData[] = [
                    'date' => $date->format('M d'),
                    'requests' => $count
                ];
            }
            
            // 6. Calculate trends
            $residentTrend = $this->calculateResidentTrend();
            $pendingTrend = $this->calculatePendingTrend($pendingStatusId);
            
            return response()->json([
                'stats' => [
                    'total_residents' => $totalResidents,
                    'total_requests' => $totalRequests,
                    'pending_requests' => $pendingRequests,
                    'approved_requests' => $approvedRequests,
                    'completed_requests' => $completedRequests,
                    'rejected_requests' => $rejectedRequests,
                ],
                'trends' => [
                    'residents' => $residentTrend,
                    'pending' => $pendingTrend,
                ],
                'document_distribution' => $documentDistribution,
                'trend_data' => $trendData,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Admin Dashboard Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching dashboard data'], 500);
        }
    }

    // Calculate resident trend (Uses Resident table to track new registrations)
    private function calculateResidentTrend()
    {
        try {
            $thisWeek = Resident::where('created_at', '>=', Carbon::now()->startOfWeek())->count();
                
            $lastWeek = Resident::whereBetween('created_at', [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek()
            ])->count();
            
            if ($lastWeek == 0) return $thisWeek > 0 ? 100 : 0;
            
            return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1);
        } catch (\Exception $e) {
            Log::error('Resident Trend Error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }
    
    // Calculate pending requests trend
    private function calculatePendingTrend($statusId)
    {
        try {
            if (!$statusId) return 0;
            
            $thisWeek = DocumentRequest::where('status_id', $statusId)
                ->where('created_at', '>=', Carbon::now()->startOfWeek())
                ->count();
            
            $lastWeek = DocumentRequest::where('status_id', $statusId)
                ->whereBetween('created_at', [
                    Carbon::now()->subWeek()->startOfWeek(),
                    Carbon::now()->subWeek()->endOfWeek()
                ])->count();
            
            if ($lastWeek == 0) return $thisWeek > 0 ? 100 : 0;
            
            return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1);
        } catch (\Exception $e) {
            Log::error('Pending Trend Error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}