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
        Schema::table('Main.JobOrderTechnicians', function (Blueprint $table) {
            $table->integer('timer_baseline')->default(0)->after('accumulated_seconds');
        });
    }

    public function down(): void
    {
        Schema::table('Main.JobOrderTechnicians', function (Blueprint $table) {
            $table->dropColumn('timer_baseline');
        });
    }
};
