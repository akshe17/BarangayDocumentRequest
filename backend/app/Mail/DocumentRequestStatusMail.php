<?php

namespace App\Mail;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentRequestStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public DocumentRequest $documentRequest,
        public string          $statusType,
        public ?string         $reason = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Update on your Document Request: '
                . $this->documentRequest->documentType->document_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document_status',
            with: [
                'documentRequest' => $this->documentRequest,
                'statusType'      => $this->statusType,
                'reason'          => $this->reason,
            ],
        );
    }
}