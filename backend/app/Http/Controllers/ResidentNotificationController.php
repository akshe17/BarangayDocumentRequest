<?php

namespace App\Http\Controllers;

use App\Models\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResidentNotificationController extends Controller
{
    /**
     * Display only logs/notifications for the logged-in resident.
     */
    public function index()
    {
        // Filter by authenticated user ID (receiver_id)
        $notifications = Inbox::where('receiver_user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedNotifications = $notifications->map(function ($notif) {
            return [
                'id' => $notif->inbox_id,
                'type' => $notif->type, 
                'title' => $notif->title,
                'message' => $notif->message,
                'time' => $notif->created_at->diffForHumans(), // e.g., "5 mins ago"
                'date' => $notif->created_at->format('M d, Y'),
                'status' => $notif->is_read ? 'read' : 'unread', 
                'category' => $notif->category, 
            ];
        });

        return response()->json($formattedNotifications);
    }

    /**
     * Mark a notification as read (No deletion functionality).
     */
    public function markAsRead($id)
    {
        $notification = Inbox::where('receiver_user_id', Auth::id())->findOrFail($id);
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }
}