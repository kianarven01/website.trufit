<?php

namespace App\Domains\Vehicle\Application\Services;

use App\Domains\Product\Domain\Models\Manufacturers;

class ManufacturerService
{
    public function getAll()
    {
        return Manufacturers::query()
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function create(array $data)
    {
        return Manufacturers::create([
            'name' => $data['name'],
        ]);
    }
}