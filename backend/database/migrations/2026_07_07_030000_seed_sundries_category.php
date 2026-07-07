<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('Main.Category')->updateOrInsert(
            ['id' => 1],
            [
                'name' => 'Sundries',
                'is_spol' => true,
                'is_active' => true,
            ]
        );
    }

    public function down(): void
    {
        DB::table('Main.Category')->where('id', 1)->delete();
    }
};
