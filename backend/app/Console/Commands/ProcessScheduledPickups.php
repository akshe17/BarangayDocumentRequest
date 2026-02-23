<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DocumentRequest;
use App\Models\ActionLog;
use App\Mail\DocumentRequestStatusMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ProcessScheduledPickups extends Command
{
    protected $signature   = 'pickups:process';
    protected $description = 'Move Approved requests whose pickup date has arrived to Ready for Pickup';

    public function handle()
    {
        $due = DocumentRequest::with(['documentType', 'resident.user'])
            ->where('status_id', 2)
            ->whereDate('pickup_date', '<=', Carbon::today())
            ->get();

        foreach ($due as $doc) {
            $doc->update(['status_id' => 5]);

            ActionLog::create([
                'user_id'    => null,
                'request_id' => $doc->request_id,
                'action'     => 'AUTO_READY_FOR_PICKUP',
                'details'    => 'Automatically set to Ready for Pickup on scheduled date.',
            ]);

            if ($doc->resident->user->email) {
                Mail::to($doc->resident->user->email)
                    ->send(new DocumentRequestStatusMail($doc, 'ready'));
            }
        }

        $this->info("Processed {$due->count()} request(s).");
    }
}