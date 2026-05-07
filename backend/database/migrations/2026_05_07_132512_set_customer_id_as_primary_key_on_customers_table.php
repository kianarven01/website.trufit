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
        // Using raw SQL because the table is in the 'Main' schema
        // and we want to ensure the primary key is correctly assigned.
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Customers" ADD PRIMARY KEY (customer_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Customers" DROP CONSTRAINT IF EXISTS Customers_pkey');
    }
};
