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
        \Illuminate\Support\Facades\DB::transaction(function () {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" DROP COLUMN IF EXISTS customer_id CASCADE');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" ADD COLUMN customer_id bigint');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "estimates_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES "Main"."Customers"(customer_id) ON DELETE CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "estimates_customer_id_fkey"');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" DROP COLUMN IF EXISTS customer_id');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" ADD COLUMN customer_id uuid');
        });
    }
};
