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
        Schema::create('residents', function (Blueprint $table) {
            $table->id('resident_id');
            // FKs
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('gender_id')->constrained('genders', 'gender_id');
            $table->foreignId('civil_status_id')->constrained('civil_statuses', 'civil_status_id');
            // Optional: Add a foreign key constraint to ensure data integrity
            $table->foreign('verified_by')->references('user_id')->on('users')->onDelete('set null');

            // --- REMOVED NAMES FROM HERE ---
            
            $table->date('birthdate');
            $table->string('house_no', 50);

            $table->string('id_image_path')->nullable(); 
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};