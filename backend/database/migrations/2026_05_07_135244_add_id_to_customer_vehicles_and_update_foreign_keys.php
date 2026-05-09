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
            // 1. Add id to CustomerVehicles
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" ADD COLUMN id bigint GENERATED ALWAYS AS IDENTITY');

            // 2. Drop existing PK (plate_number) and its dependents
            // CASCADE will drop the foreign keys in JobOrder and Warranties
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP CONSTRAINT IF EXISTS customervehicles_pkey CASCADE');

            // 3. Add new PK (id)
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" ADD PRIMARY KEY (id)');

            // 4. Make plate_number UNIQUE (so we can still look it up uniquely)
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" ADD CONSTRAINT customervehicles_plate_number_key UNIQUE (plate_number)');

            // 5. Update Appointments
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Appointments" ADD COLUMN vehicle_id bigint');
            \Illuminate\Support\Facades\DB::statement('UPDATE "Main"."Appointments" a SET vehicle_id = v.id FROM "Main"."CustomerVehicles" v WHERE a.plate_number = v.plate_number');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Appointments" ADD CONSTRAINT "appointments_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES "Main"."CustomerVehicles"(id) ON DELETE SET NULL');

            // 6. Update JobOrder
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."JobOrder" ADD COLUMN vehicle_id_new bigint');
            \Illuminate\Support\Facades\DB::statement('UPDATE "Main"."JobOrder" j SET vehicle_id_new = v.id FROM "Main"."CustomerVehicles" v WHERE j."VehicleID" = v.plate_number');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."JobOrder" ADD CONSTRAINT "joborder_vehicle_id_fkey" FOREIGN KEY (vehicle_id_new) REFERENCES "Main"."CustomerVehicles"(id)');

            // 7. Update Warranties
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Warranties" ADD COLUMN vehicle_id_new bigint');
            \Illuminate\Support\Facades\DB::statement('UPDATE "Main"."Warranties" w SET vehicle_id_new = v.id FROM "Main"."CustomerVehicles" v WHERE w."VehicleID" = v.plate_number');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Warranties" ADD CONSTRAINT "warranties_vehicle_id_fkey" FOREIGN KEY (vehicle_id_new) REFERENCES "Main"."CustomerVehicles"(id)');

            // 8. Update Estimates
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" RENAME COLUMN vehicle_id TO vehicle_id_old');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" ADD COLUMN vehicle_id bigint');
            \Illuminate\Support\Facades\DB::statement('UPDATE "Main"."Estimates" e SET vehicle_id = v.id FROM "Main"."CustomerVehicles" v WHERE e.vehicle_id_old = v.plate_number');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "estimates_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES "Main"."CustomerVehicles"(id)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP CONSTRAINT IF EXISTS customervehicles_plate_number_key');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP CONSTRAINT IF EXISTS customervehicles_pkey CASCADE');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" ADD PRIMARY KEY (plate_number)');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP COLUMN IF EXISTS id');
            
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Appointments" DROP COLUMN IF EXISTS vehicle_id');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."JobOrder" DROP COLUMN IF EXISTS vehicle_id_new');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Warranties" DROP COLUMN IF EXISTS vehicle_id_new');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" DROP COLUMN IF EXISTS vehicle_id');
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE "Main"."Estimates" RENAME COLUMN vehicle_id_old TO vehicle_id');
        });
    }
};
