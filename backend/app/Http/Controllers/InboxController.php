<?php

namespace App\Http\Controllers;

use App\Models\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InboxController extends Controller
{
    
    public function index()
    {
       
        $logs = Inbox::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedLogs = $logs->map(function ($log) {
            return [
                'id' => $log->inbox_id, 
                'action' => $log->title, 
                'description' => $log->message, 
                'user' => $log->sender ? ($log->sender->first_name . ' ' . $log->sender->last_name) : 'System',
                'userRole' => 'Administrator', 
                'time' => $log->created_at->format('h:i A'),
                'date' => $log->created_at->format('M d, Y'),
              
                'type' => $log->is_read ? 'read' : 'unread', 
                'color' => $log->is_read ? 'gray' : 'emerald',
            ];
        });

        return response()->json($formattedLogs);
    }
}