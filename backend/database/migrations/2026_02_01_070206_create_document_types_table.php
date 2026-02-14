<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id('document_id');
            $table->string('document_name');
            // --- ADDED THIS LINE ---
            $table->string('template_path')->nullable(); // e.g., 'templates/clearance.docx'
            // -----------------------
            $table->decimal('fee', 8, 2)->default(0.00);
            $table->boolean('in_use')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};