<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('document_requests', function (Blueprint $table) {
    $table->id('request_id');
    $table->foreignId('resident_id')->constrained('residents', 'resident_id');
    $table->foreignId('status_id')->constrained('request_statuses', 'status_id');
    
    $table->string('purpose', 255);
    $table->timestamp('request_date')->useCurrent();
    $table->date('pickup_date')->nullable();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
