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
    Schema::create('request_form_fields', function (Blueprint $table) {
        $table->id('field_id');
        $table->foreignId('document_id')->constrained('document_types', 'document_id')->onDelete('cascade');
        $table->string('field_label'); 
        $table->string('field_type');  // text, number, date
        $table->boolean('is_required')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_form_fields');
    }
};
