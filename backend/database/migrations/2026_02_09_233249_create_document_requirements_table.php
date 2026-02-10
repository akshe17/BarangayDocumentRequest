<?php
// database/migrations/xxxx_xx_xx_create_document_requirements_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id('requirement_id');
            // Foreign Key
            $table->foreignId('document_id')
                  ->constrained('document_types', 'document_id')
                  ->onDelete('cascade');
            $table->string('requirement_name');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requirements');
    }
};