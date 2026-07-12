<?php

namespace App\Domains\Purchasing\Application\Services\Traits;

use App\Domains\Inventory\Domain\Models\StockLocation;

trait ResolvesDefaultLocation
{
    private function getDefaultLocationId(): ?string
    {
        $location = StockLocation::where('is_active', true)->orderBy('name')->first();
        return $location?->id;
    }
}
