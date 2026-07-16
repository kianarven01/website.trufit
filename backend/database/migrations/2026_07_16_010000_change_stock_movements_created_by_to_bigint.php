<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop constraint if any
        DB::statement('ALTER TABLE "Main"."StockMovements" DROP COLUMN IF EXISTS created_by');

        Schema::connection('pgsql')->table('Main.StockMovements', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable();
            
            $table->foreign('created_by')
                ->references('id')
                ->on('UserCredentials')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.StockMovements', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });

        DB::statement('ALTER TABLE "Main"."StockMovements" DROP COLUMN IF EXISTS created_by');

        Schema::connection('pgsql')->table('Main.StockMovements', function (Blueprint $table) {
            $table->uuid('created_by')->nullable();
        });
    }
};
