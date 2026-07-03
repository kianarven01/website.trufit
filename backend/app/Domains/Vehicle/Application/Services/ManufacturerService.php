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
                $normalized = strtolower($type) === 'parts' ? 'Part' : ucfirst($type);
                $query->whereIn('type', [$type, $normalized, strtolower($type)]);
            })
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Manufacturers
    {
        $type = $data['type'];
        if (strtolower($type) === 'vehicle') {
            $type = 'Vehicle';
        } elseif (strtolower($type) === 'parts' || strtolower($type) === 'part') {
            $type = 'Part';
        }

        return Manufacturers::create([
            'name' => $data['name'],
            'type' => $type,
        ]);
    }
}