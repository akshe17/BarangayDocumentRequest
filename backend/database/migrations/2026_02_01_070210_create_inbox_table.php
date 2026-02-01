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
      Schema::create('inbox', function (Blueprint $table) {
    $table->id('inbox_id');
    // Two FKs pointing to the same table (Users)
    $table->foreignId('sender_user_id')->constrained('users', 'user_id');
    $table->foreignId('receiver_user_id')->constrained('users', 'user_id');
    
    $table->string('title', 100);
    $table->text('message');
    $table->boolean('is_read')->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inbox');
    }
};
