<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Split single 'name' column into 'first_name' + 'last_name'
     * for Employees, RegistrationKeys, and Customers tables.
     */
    public function up(): void
    {
        // ── Employees ──
        Schema::table('Employees', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
        });

        // Migrate existing data: put entire name into first_name
        DB::table('Employees')->whereNotNull('name')->update([
            'first_name' => DB::raw('name'),
            'last_name'  => '',
        ]);

        Schema::table('Employees', function (Blueprint $table) {
            $table->dropColumn('name');
        });

        // ── RegistrationKeys ──
        Schema::table('RegistrationKeys', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('employee_id');
            $table->string('last_name')->nullable()->after('first_name');
        });

        // Migrate existing data: put entire employee_name into first_name
        DB::table('RegistrationKeys')->whereNotNull('employee_name')->update([
            'first_name' => DB::raw('employee_name'),
            'last_name'  => '',
        ]);

        Schema::table('RegistrationKeys', function (Blueprint $table) {
            $table->dropColumn('employee_name');
        });

        // ── Customers ──
        if (Schema::hasTable('Customers')) {
            DB::statement('ALTER TABLE "Customers" REPLICA IDENTITY FULL');

            Schema::table('Customers', function (Blueprint $table) {
                $table->string('first_name')->nullable()->after('customer_id');
                $table->string('last_name')->nullable()->after('first_name');
            });

            DB::table('Customers')->whereNotNull('name')->update([
                'first_name' => DB::raw('name'),
                'last_name'  => '',
            ]);

            Schema::table('Customers', function (Blueprint $table) {
                $table->dropColumn('name');
            });

            DB::statement('ALTER TABLE "Customers" REPLICA IDENTITY DEFAULT');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ── Employees ──
        Schema::table('Employees', function (Blueprint $table) {
            $table->string('name')->nullable()->after('id');
        });

        DB::table('Employees')->update([
            'name' => DB::raw("CONCAT(first_name, ' ', last_name)"),
        ]);

        Schema::table('Employees', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });

        // ── RegistrationKeys ──
        Schema::table('RegistrationKeys', function (Blueprint $table) {
            $table->string('employee_name')->nullable()->after('employee_id');
        });

        DB::table('RegistrationKeys')->update([
            'employee_name' => DB::raw("CONCAT(first_name, ' ', last_name)"),
        ]);

        Schema::table('RegistrationKeys', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });

        // ── Customers ──
        if (Schema::hasTable('Customers')) {
            Schema::table('Customers', function (Blueprint $table) {
                $table->string('name')->nullable()->after('customer_id');
            });

            DB::table('Customers')->update([
                'name' => DB::raw("CONCAT(first_name, ' ', last_name)"),
            ]);

            Schema::table('Customers', function (Blueprint $table) {
                $table->dropColumn(['first_name', 'last_name']);
            });
        }
    }
};
