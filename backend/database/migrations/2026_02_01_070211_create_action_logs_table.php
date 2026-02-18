<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
      // Renamed from 'inbox' to 'action_logs'
      Schema::create('action_logs', function (Blueprint $table) {
        $table->id('log_id');
        // FK pointing to the User who performed the action
        $table->foreignId('user_id')->constrained('users', 'user_id');
        // FK pointing to the Request being acted upon
  $table->foreignId('request_id')->nullable()->constrained('document_requests', 'request_id');
        $table->string('action', 100); // e.g., 'Status Updated', 'Request Created'
        $table->text('details')->nullable(); // e.g., 'From Pending to Approved'
        $table->timestamp('created_at')->useCurrent();
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('action_logs');
    }
};