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
        Schema::table('document_types', function (Blueprint $table) {
            $table->unsignedBigInteger('handler_role_id')->nullable()->after('in_use');

            $table->foreign('handler_role_id')
                  ->references('role_id')
                  ->on('roles')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('document_types', function (Blueprint $table) {
            $table->dropForeign(['handler_role_id']);
            $table->dropColumn('handler_role_id');
        });
    }
};
