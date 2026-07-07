<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix: If id=1 was overwritten to "Sundries" by the previous migration, restore it
        $id1 = DB::table('Main.Category')->where('id', 1)->first();

        if ($id1 && $id1->name === 'Sundries' && $id1->is_spol) {
            // Check if any products are assigned to this category
            $hasProducts = DB::table('Main.Products')->where('category_id', 1)->exists();

            if ($hasProducts) {
                // Restore id=1 as a regular non-spol category so existing products aren't broken
                DB::table('Main.Category')->where('id', 1)->update([
                    'name' => 'General',
                    'is_spol' => false,
                ]);
            } else {
                // No products use id=1, just un-spol it
                DB::table('Main.Category')->where('id', 1)->update([
                    'is_spol' => false,
                ]);
            }
        }

        // Create "Sundries" category fresh (auto-increment ID, no fixed ID)
        DB::table('Main.Category')->updateOrInsert(
            ['name' => 'Sundries'],
            [
                'is_spol' => true,
                'is_active' => true,
            ]
        );
    }

    public function down(): void
    {
        DB::table('Main.Category')->where('name', 'Sundries')->delete();
    }
};
