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
        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->string('estimate_number')->nullable()->unique();
        });

        // Backfill existing estimates
        $estimates = \App\Domains\Estimate\Domain\Models\Estimate::orderBy('created_at', 'asc')->get();
        $sequences = [];

        foreach ($estimates as $estimate) {
            $date = $estimate->created_at ?: now();
            $dateStr = $date->format('ymd');
            
            if (!isset($sequences[$dateStr])) {
                $sequences[$dateStr] = 1;
            } else {
                $sequences[$dateStr]++;
            }

            $estimateNumber = 'EST-' . $dateStr . '-' . str_pad($sequences[$dateStr], 3, '0', STR_PAD_LEFT);
            $estimate->update(['estimate_number' => $estimateNumber]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->dropColumn('estimate_number');
        });
    }
};
