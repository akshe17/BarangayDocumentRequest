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
      Schema::create('users', function (Blueprint $table) {
        $table->id('user_id');
        // FK: Points to roles table
        $table->foreignId('role_id')->constrained('roles', 'role_id')->onDelete('cascade');
        
        // FK: Points to zones table, nullable for non-zone leaders
        $table->foreignId('zone_id')->nullable()->constrained('zones', 'zone_id')->onDelete('set null');
        
        // --- ADDED THESE LINES ---
        $table->string('first_name', 50);
        $table->string('last_name', 50);
        // -------------------------

        $table->string('email', 100)->unique();
        $table->string('password', 255);
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};