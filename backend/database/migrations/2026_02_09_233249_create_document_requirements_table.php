<?php
// database/migrations/xxxx_xx_xx_create_document_requirements_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id('requirement_id');
            // Link to the document_types table
            $table->unsignedBigInteger('document_id');
            $table->string('requirement_name', 255); // e.g., "Valid ID", "Cedula"
            $table->text('description')->nullable(); // e.g., "Photocopy of any government issued ID"
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('document_id')
                  ->references('document_id')
                  ->on('document_types')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requirements');
    }
};