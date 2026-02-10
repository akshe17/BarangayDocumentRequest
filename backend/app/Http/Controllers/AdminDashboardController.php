<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\RequestStatus;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
   // app/Http/Controllers/AdminDashboardController.php

public function getOverview()
{
    try {
        // Get total active residents
        $totalResidents = Resident::where('is_active', 1)->count();
        
        // Get status IDs first
        $pendingStatusId = RequestStatus::where('status_name', 'Pending')->value('status_id');
        $approvedStatusId = RequestStatus::where('status_name', 'Approved')->value('status_id');
        $completedStatusId = RequestStatus::where('status_name', 'Completed')->value('status_id');
        $rejectedStatusId = RequestStatus::where('status_name', 'Rejected')->value('status_id');
        
        // --- UPDATED STATS CALCULATION ---
        $totalRequests = DocumentRequest::count();
        $pendingRequests = DocumentRequest::where('status_id', $pendingStatusId)->count();
        $approvedRequests = DocumentRequest::where('status_id', $approvedStatusId)->count();
        $completedRequests = DocumentRequest::where('status_id', $completedStatusId)->count();
        $rejectedRequests = DocumentRequest::where('status_id', $rejectedStatusId)->count();
        // ---------------------------------
        
        // Get document type distribution
        $documentDistribution = DB::table('request_items')
            ->join('document_types', 'request_items.document_id', '=', 'document_types.document_id')
            ->select(
                'document_types.document_name as name',
                DB::raw('COUNT(*) as value')
            )
            ->groupBy('document_types.document_id', 'document_types.document_name')
            ->orderBy('value', 'desc')
            ->limit(4)
            ->get();
        
        // Get trend data for the last 7 days
        $trendData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = DocumentRequest::whereDate('created_at', $date->toDateString())->count();
            
            $trendData[] = [
                'date' => $date->format('M d'),
                'requests' => $count
            ];
        }
        
        // Calculate trends
        $residentTrend = $this->calculateResidentTrend();
        $pendingTrend = $this->calculatePendingTrend($pendingStatusId);
        
        return response()->json([
            'stats' => [
                'total_residents' => $totalResidents,
                'total_requests' => $totalRequests, // New
                'pending_requests' => $pendingRequests,
                'approved_requests' => $approvedRequests, // New
                'completed_requests' => $completedRequests, // New
                'rejected_requests' => $rejectedRequests, // New
            ],
            'trends' => [
                'residents' => $residentTrend,
                'pending' => $pendingTrend,
            ],
            'document_distribution' => $documentDistribution,
            'trend_data' => $trendData,
        ], 200);

    } catch (\Exception $e) {
        \Log::error('Admin Dashboard Error:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error fetching dashboard data'], 500);
    }
}
    // Calculate resident trend
    private function calculateResidentTrend()
    {
        try {
            $thisWeek = Resident::where('created_at', '>=', Carbon::now()->startOfWeek())
                ->count();
                
            $lastWeek = Resident::whereBetween('created_at', [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek()
            ])
            ->count();
            
            if ($lastWeek == 0) return $thisWeek > 0 ? 100 : 0;
            
            return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1);
        } catch (\Exception $e) {
            \Log::error('Resident Trend Error:', ['error' => $e->getMessage()]);
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
                ])
                ->count();
            
            if ($lastWeek == 0) return $thisWeek > 0 ? 100 : 0;
            
            // Negative trend is good for pending (less pending = better)
            return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1);
        } catch (\Exception $e) {
            \Log::error('Pending Trend Error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }
    
    // Calculate completed requests trend
    private function calculateCompletedTrend($statusId)
    {
        try {
            if (!$statusId) return 0;
            
            $thisWeek = DocumentRequest::where('status_id', $statusId)
                ->where('updated_at', '>=', Carbon::now()->startOfWeek())
                ->count();
            
            $lastWeek = DocumentRequest::where('status_id', $statusId)
                ->whereBetween('updated_at', [
                    Carbon::now()->subWeek()->startOfWeek(),
                    Carbon::now()->subWeek()->endOfWeek()
                ])
                ->count();
            
            if ($lastWeek == 0) return $thisWeek > 0 ? 100 : 0;
            
            return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1);
        } catch (\Exception $e) {
            \Log::error('Completed Trend Error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}