<?php

namespace App\Domains\Vehicle\Application\Services;

use App\Domains\Product\Domain\Models\Manufacturers;

class ManufacturerService
{
    public function findOrCreateByName(string $name): Manufacturers
    {
        return Manufacturers::firstOrCreate(
            ['name' => ucfirst(strtolower(trim($name)))],
            ['type' => 'vehicle']
        );
    }
}
