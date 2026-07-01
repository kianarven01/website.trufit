<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->integer('created_by')->nullable();
            $table->integer('edited_by')->nullable();
            $table->integer('approved_by')->nullable();

            $table->foreign('created_by')->references('id')->on('Main.Employees')->onDelete('set null');
            $table->foreign('edited_by')->references('id')->on('Main.Employees')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('Main.Employees')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['edited_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['created_by', 'edited_by', 'approved_by']);
        });
    }
};
