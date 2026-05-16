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
        Schema::create('Main.ServiceCategory', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('Main.ServiceType', function (Blueprint $table) {
            $table->foreignId('service_category_id')
                ->nullable()
                ->after('category')
                ->constrained('Main.ServiceCategory')
                ->onDelete('set null');
        });

        // Migrate existing data from string column to relational table
        $categories = \Illuminate\Support\Facades\DB::table('Main.ServiceType')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        foreach ($categories as $catName) {
            $id = \Illuminate\Support\Facades\DB::table('Main.ServiceCategory')->insertGetId([
                'name' => $catName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            \Illuminate\Support\Facades\DB::table('Main.ServiceType')
                ->where('category', $catName)
                ->update(['service_category_id' => $id]);
        }
    }

    public function down(): void
    {
        Schema::table('Main.ServiceType', function (Blueprint $table) {
            $table->dropForeign(['service_category_id']);
            $table->dropColumn('service_category_id');
        });
        Schema::dropIfExists('Main.ServiceCategory');
    }
};
