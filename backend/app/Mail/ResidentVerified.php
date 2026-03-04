<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResidentVerified extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $resident,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Account Has Been Verified',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.resident_verified',
            with: [
                'firstName' => $this->resident->first_name,
                'lastName'  => $this->resident->last_name,
                'loginUrl'  => config('app.url') . '/login',
            ],
        );
    }
}