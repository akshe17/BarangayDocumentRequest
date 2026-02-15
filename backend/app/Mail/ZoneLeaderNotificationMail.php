<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
class ZoneLeaderNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $resident;
    public $leader;

    public function __construct(User $resident, User $leader)
    {
        $this->resident = $resident;
        $this->leader = $leader;
    }

    public function build()
    {
        return $this->subject('New Resident Registration Pending Review')
                    ->view('emails.zone_leader_notification'); // Create this view
    }
}