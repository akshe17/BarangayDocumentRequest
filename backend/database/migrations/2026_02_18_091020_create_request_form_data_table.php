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
    Schema::create('request_form_data', function (Blueprint $table) {
        $table->id('data_id');
        $table->foreignId('request_id')->constrained('document_requests', 'request_id')->onDelete('cascade');
        $table->foreignId('field_id')->constrained('request_form_fields', 'field_id')->onDelete('cascade');
        $table->text('field_value'); 
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_form_data');
    }
};
