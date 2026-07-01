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
        Schema::table('Main.Suppliers', function (Blueprint $table) {
            $table->text('address');
            $table->string('Email')->nullable(false)->change();
            $table->text('CompanyContact')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.Suppliers', function (Blueprint $table) {
            $table->dropColumn('address');
            $table->string('Email')->nullable()->change();
            $table->text('CompanyContact')->nullable()->change();
        });
    }
};
