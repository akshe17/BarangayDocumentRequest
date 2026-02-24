<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use Illuminate\Http\Request;

class AdminLogsController extends Controller
{
    public function index()
    {
        // Fetch logs with user info, latest first
        $logs = ActionLog::with(['user.role'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}