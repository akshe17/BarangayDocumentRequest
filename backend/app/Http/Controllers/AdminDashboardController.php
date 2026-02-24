<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\DocumentRequest;
use App\Models\Zone;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard/overview
     *
     * Status IDs  →  status_name
     *   1 = pending
     *   2 = approved
     *   3 = completed
     *   4 = rejected
     *   5 = ready for pickup
     */
    public function getOverview()
    {
        $now        = Carbon::now();
        $thirtyDays = $now->copy()->subDays(30);
        $sixtyDays  = $now->copy()->subDays(60);

        /* ── 1. Core aggregate stats ──────────────────────────────── */
        $totalResidents    = User::where('role_id', 2)->count();
        $totalRequests     = DocumentRequest::count();
        $pendingRequests   = DocumentRequest::where('status_id', 1)->count();
        $approvedRequests  = DocumentRequest::where('status_id', 2)->count();
        $completedRequests = DocumentRequest::where('status_id', 3)->count();
        $rejectedRequests  = DocumentRequest::where('status_id', 4)->count();
        $readyRequests     = DocumentRequest::where('status_id', 5)->count();

        /* ── 2. 30-day trends (% change vs. prior 30-day window) ──── */
        $residentsNow  = User::where('role_id', 2)
            ->whereBetween('created_at', [$thirtyDays, $now])->count();
        $residentsPrev = User::where('role_id', 2)
            ->whereBetween('created_at', [$sixtyDays, $thirtyDays])->count();
        $residentsTrend = $residentsPrev > 0
            ? round((($residentsNow - $residentsPrev) / $residentsPrev) * 100)
            : 0;

        $pendingNow  = DocumentRequest::where('status_id', 1)
            ->whereBetween('created_at', [$thirtyDays, $now])->count();
        $pendingPrev = DocumentRequest::where('status_id', 1)
            ->whereBetween('created_at', [$sixtyDays, $thirtyDays])->count();
        $pendingTrend = $pendingPrev > 0
            ? round((($pendingNow - $pendingPrev) / $pendingPrev) * 100)
            : 0;

        /* ── 3. Daily request counts — last 30 days (area chart) ──── */
        $trendData = DocumentRequest::selectRaw('DATE(created_at) as date, COUNT(*) as requests')
            ->where('created_at', '>=', $thirtyDays)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn($r) => [
                'date'     => Carbon::parse($r->date)->format('M d'),
                'requests' => (int) $r->requests,
            ]);

        /* ── 4. Document type distribution (pie chart) ────────────── */
        // FIX: column is `document_id` (not `document_type_id`)
        //      and `document_name` (not `type_name`) per DocumentType model.
        $docDistribution = DocumentRequest::selectRaw(
                'document_types.document_name as name, COUNT(*) as value'
            )
            ->join('document_types',
                'document_requests.document_id', '=',
                'document_types.document_id')
            ->groupBy('document_types.document_id', 'document_types.document_name')
            ->orderByDesc('value')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->name,
                'value' => (int) $r->value,
            ]);

        /* ── 5. Recent requests — activity feed ───────────────────── */
        // FIX: DocumentRequest has NO direct user() relationship.
        //      Chain: DocumentRequest → resident() → user() instead.
        // FIX: DocumentType column is `document_name`, not `type_name`.
        $recentRequests = DocumentRequest::with(['resident.user', 'documentType', 'status'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'resident_name' => trim(
                    ($r->resident?->user?->first_name ?? '') . ' ' .
                    ($r->resident?->user?->last_name  ?? '')
                ) ?: 'Unknown',
                'document_type' => $r->documentType?->document_name ?? 'Unknown',
                'status'        => ucwords($r->status?->status_name ?? 'Unknown'),
                'date'          => $r->created_at->diffForHumans(),
            ]);

        /* ── 6. Residents per zone (bar chart) ────────────────────── */
        // FIX: `zone_id` lives on the `users` table, not `residents`.
        //      Zone model has no users() relationship, so join manually.
        $zoneDistribution = Zone::select('zones.zone_id', 'zones.zone_name')
            ->selectRaw('COUNT(users.user_id) as residents')
            ->leftJoin('users', function ($join) {
                $join->on('users.zone_id', '=', 'zones.zone_id')
                     ->where('users.role_id', '=', 2);
            })
            ->groupBy('zones.zone_id', 'zones.zone_name')
            ->orderBy('zones.zone_name')
            ->get()
            ->map(fn($z) => [
                'zone'      => $z->zone_name,
                'residents' => (int) $z->residents,
            ]);

        /* ── 7. Staff headcount by role ───────────────────────────── */
        $staffSummary = User::selectRaw('roles.role_name as role, COUNT(*) as count')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->whereNotIn('users.role_id', [1, 2])
            ->groupBy('roles.role_id', 'roles.role_name')
            ->orderBy('roles.role_name')
            ->get()
            ->map(fn($r) => [
                'role'  => $r->role,
                'count' => (int) $r->count,
            ]);

        /* ── Response ─────────────────────────────────────────────── */
        return response()->json([
            'stats' => [
                'total_residents'    => $totalResidents,
                'total_requests'     => $totalRequests,
                'pending_requests'   => $pendingRequests,
                'approved_requests'  => $approvedRequests,
                'completed_requests' => $completedRequests,
                'rejected_requests'  => $rejectedRequests,
                'ready_requests'     => $readyRequests,
            ],
            'trends' => [
                'residents' => $residentsTrend,
                'pending'   => $pendingTrend,
            ],
            'trend_data'            => $trendData,
            'document_distribution' => $docDistribution,
            'recent_requests'       => $recentRequests,
            'zone_distribution'     => $zoneDistribution,
            'staff_summary'         => $staffSummary,
        ]);
    }
}