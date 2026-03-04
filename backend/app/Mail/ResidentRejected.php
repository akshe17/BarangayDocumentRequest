<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResidentRejected extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $resident,
        public string $reason,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Account Verification Was Rejected',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.resident_rejected',
            with: [
                'firstName' => $this->resident->first_name,
                'lastName'  => $this->resident->last_name,
                'reason'    => $this->reason,
                'loginUrl'  => config('app.url') . '/login',
            ],
        );
    }
}