<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use Illuminate\Http\Request;

class AdminLogsController extends Controller
{
    /**
     * GET /api/admin/audit-logs
     *
     * Query params:
     *   search    – string: matches action, details, or user full name
     *   type      – string: update | delete | security | active | inactive | general
     *   date      – string: today | week | month  (default: all time)
     *   per_page  – int:    rows per page          (default: 15, max: 100)
     *   page      – int:    current page            (default: 1)
     */
    public function index(Request $request)
    {
        $search  = $request->input('search', '');
        $type    = $request->input('type', 'all');
        $date    = $request->input('date', 'all');
        $perPage = min((int) $request->input('per_page', 15), 100);

        $query = ActionLog::with(['user.role'])
            ->orderBy('created_at', 'desc');

        /* ── Search: action, details, or user name ── */
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where(\Illuminate\Support\Facades\DB::raw("CONCAT(first_name,' ',last_name)"), 'like', "%{$search}%");
                  });
            });
        }

        /* ── Type filter: maps UI label to keyword in `action` column ── */
        $typeKeywords = [
            'update'   => ['update', 'edit'],
            'delete'   => ['delete'],
            'security' => ['password'],
            'active'   => ['enabled', 'active'],
            'inactive' => ['disabled'],
        ];

        if ($type !== 'all' && isset($typeKeywords[$type])) {
            $keywords = $typeKeywords[$type];
            $query->where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $q->orWhere('action', 'like', "%{$kw}%");
                }
            });
        }

        /* ── Date filter ── */
        match ($date) {
            'today' => $query->whereDate('created_at', now()->toDateString()),
            'week'  => $query->where('created_at', '>=', now()->startOfWeek()),
            'month' => $query->where('created_at', '>=', now()->startOfMonth()),
            default => null,
        };

        /* ── Paginate ── */
        $paginated = $query->paginate($perPage);

        /* ── Shape each log for the frontend ── */
        $items = collect($paginated->items())->map(function ($log) {
            return [
                'log_id'     => $log->log_id,
                'action'     => $log->action,
                'details'    => $log->details,
                'created_at' => $log->created_at->toIso8601String(),
                'user'       => $log->user ? [
                    'first_name' => $log->user->first_name,
                    'last_name'  => $log->user->last_name,
                    'role'       => [
                        'role_name' => $log->user->role?->role_name ?? 'Unknown',
                    ],
                ] : null,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'from'         => $paginated->firstItem(),
                'to'           => $paginated->lastItem(),
            ],
        ]);
    }
}