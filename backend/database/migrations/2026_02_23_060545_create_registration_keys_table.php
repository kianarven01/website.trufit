<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('Main.RegistrationKeys', function (Blueprint $table) {
            $table->id();
            $table->string('key_code')->unique();
            $table->foreignId('role_id')->constrained('Main.Roles');
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Main.RegistrationKeys');
    }
};
