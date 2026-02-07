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
    
    $table->string('first_name', 50);
    $table->string('last_name', 50);
    $table->date('birthdate');
    $table->string('house_no', 50);
    $table->string('zone', 100);

    // Inside create_residents_table.php
$table->string('id_image_path')->nullable(); // Stores the path to the uploaded image
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
