<?php

namespace App\Mail;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DocumentRequestStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $documentRequest;
    public $statusType; // 'approved', 'rejected', 'ready'
    public $reason;

    public function __construct(DocumentRequest $documentRequest, $statusType, $reason = null)
    {
        $this->documentRequest = $documentRequest;
        $this->statusType = $statusType;
        $this->reason = $reason;
    }

    public function build()
    {
        $subject = "Update on your Document Request: " . $this->documentRequest->documentType->document_name;
        
        return $this->subject($subject)
                    ->view('emails.document_status');
    }
}