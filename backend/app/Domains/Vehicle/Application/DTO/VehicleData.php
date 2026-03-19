<?php

namespace App\Domains\Vehicle\Application\DTO;

class VehicleData
{
    public function __construct(
        public string $manufacturer_id,
        public string $model,
        public ?string $image_url,
    ) {}
}
