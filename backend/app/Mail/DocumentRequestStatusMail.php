<?php

namespace App\Mail;

use App\Models\DocumentRequest;
use App\Models\User;
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
        public ?string         $reason     = null,
        public ?User           $zoneLeader = null,
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
        // Build zone leader pickup address if applicable
        $zoneLeaderAddress = null;

        if ($this->zoneLeader) {
            $zl       = $this->zoneLeader->zoneLeader;
            $zoneName = $zl?->zone?->zone_name ?? 'your zone';
            $houseNo  = $zl?->house_no         ?? null;

            $zoneLeaderAddress = $houseNo
                ? "House No. {$houseNo}, {$zoneName}"
                : $zoneName;
        }

        // FIX: Pull from `requirements` relationship (requirement_name + description)
        // instead of fieldDefinitions (which are dynamic form input fields, not requirements).
        $requirements = collect(
            $this->documentRequest->documentType?->requirements ?? []
        )->map(function ($req) {
            $name = $req->requirement_name ?? null;
            $desc = $req->description      ?? null;

            if (!$name) return null;

            // e.g. "Valid I.D — You may bring school I.D"
            return $desc ? "{$name} — {$desc}" : $name;
        })
        ->filter()
        ->values()
        ->toArray();

        return new Content(
            view: 'emails.document_status',
            with: [
                'documentRequest'   => $this->documentRequest,
                'statusType'        => $this->statusType,
                'reason'            => $this->reason,
                'zoneLeaderAddress' => $zoneLeaderAddress,
                'requirements'      => $requirements,
            ],
        );
    }
}