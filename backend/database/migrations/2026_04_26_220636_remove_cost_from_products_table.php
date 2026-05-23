<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Products', function (Blueprint $table) {
            if (Schema::hasColumn('Products', 'cost')) {
                $table->dropColumn('cost');
            }
        });
    }

    public function down(): void
    {
        Schema::table('Products', function (Blueprint $table) {
            if (! Schema::hasColumn('Products', 'cost')) {
                $table->decimal('cost', 12, 2)->nullable();
            }
        });
    }
};