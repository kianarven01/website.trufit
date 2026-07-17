<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->create('Main.BillingStatementItems', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('BillingStatementID');
            $table->string('name');
            $table->integer('quantity')->default(1);
            $table->decimal('UnitPrice', 15, 2)->default(0);
            $table->decimal('SubTotal', 15, 2)->default(0);
            $table->string('type')->default('part');
            $table->timestamps();

            $table->foreign('BillingStatementID')
                ->references('id')
                ->on('Main.BillingStatement')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->dropIfExists('Main.BillingStatementItems');
    }
};
