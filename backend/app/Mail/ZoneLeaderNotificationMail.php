<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ZoneLeaderNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $resident,
        public User $leader,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Resident Registration - Action Required',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.zone_leader_notification',
            with: [
                'residentName'  => "{$this->resident->first_name} {$this->resident->last_name}",
                'residentEmail' => $this->resident->email,
                'leaderName'    => "{$this->leader->first_name} {$this->leader->last_name}",
                'zoneId'        => $this->resident->zone_id,
                'registeredAt'  => now()->format('F j, Y \a\t g:i A'),
                'reviewUrl'     => config('app.url') . '/zone-leader/residents',
            ],
        );
    }
}