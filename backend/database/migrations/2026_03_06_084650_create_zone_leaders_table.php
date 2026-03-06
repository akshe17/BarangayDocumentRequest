<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zone_leaders', function (Blueprint $table) {
            $table->id('zone_leader_id');

            // One user can only lead one zone at a time
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users', 'user_id')
                  ->onDelete('cascade');

            // One zone can only have one leader at a time
            $table->foreignId('zone_id')
                  ->unique()
                  ->constrained('zones', 'zone_id')
                  ->onDelete('cascade');

            // Leader's address details
            $table->string('house_no', 50);
      
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zone_leaders');
    }
};