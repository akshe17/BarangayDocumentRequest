<?php

namespace App\Http\Controllers;

use App\Models\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InboxController extends Controller
{
    /**
     * Display a listing of the logs for the admin.
     * Assuming these are system-wide logs stored in the 'inbox' table.
     */
    public function index()
    {
        // 1. Fetch logs, ordered by latest
        // Assuming your 'inbox' table has a 'created_at' column
        $logs = Inbox::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Map the database results to the format required by your React component
        $formattedLogs = $logs->map(function ($log) {
            return [
                'id' => $log->inbox_id, // Using the primary key from your model
                'action' => $log->title, // Mapping title to action
                'description' => $log->message, // Mapping message to description
                'user' => $log->sender ? ($log->sender->first_name . ' ' . $log->sender->last_name) : 'System',
                'userRole' => 'Administrator', // You might need to add role logic here
                'time' => $log->created_at->format('h:i A'),
                'date' => $log->created_at->format('M d, Y'),
                // You might need a specific column in DB for 'type' and 'color'
                // For now, mapping 'is_read' as a proxy for type/status
                'type' => $log->is_read ? 'read' : 'unread', 
                'color' => $log->is_read ? 'gray' : 'emerald',
            ];
        });

        return response()->json($formattedLogs);
    }
}