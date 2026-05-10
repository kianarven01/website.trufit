<?php

namespace App\Domains\Vehicle\Application\Services;

use App\Domains\Product\Domain\Models\Manufacturers;

class ManufacturerService
{
    public function getAll(?string $type = null)
    {
        return Manufacturers::query()
            ->select('id', 'name', 'type')
            ->when($type, function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Manufacturers
    {
        return Manufacturers::create([
            'name' => $data['name'],
            'type' => $data['type'],
        ]);
    }
}