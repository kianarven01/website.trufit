<?php

namespace App\Domains\Vehicle\Application\Services;

use App\Domains\Vehicle\Domain\Models\VehicleModel;

class VehicleFormatter
{
    public function format(VehicleModel $v): array
    {
        return [
            'id' => $v->id,
            'make' => $v->manufacturer?->name ?? '',
            'manufacturer_id' => $v->manufacturer_id,
            'model' => $v->model,
            'image_url' => $v->image_path,
        ];
    }
}
