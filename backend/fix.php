<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

DB::statement('ALTER TABLE "Main"."SalesOrder" ADD COLUMN vehicle_id bigint NULL');
echo "vehicle_id added\n";
