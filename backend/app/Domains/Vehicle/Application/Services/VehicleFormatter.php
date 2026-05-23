<?php

namespace App\Domains\Vehicle\Application\Services;

use App\Domains\Vehicle\Domain\Models\VehicleModel;

class VehicleFormatter
{
    public function format(VehicleModel $vehicle): array
    {
        $baseUrl = rtrim(env('SUPABASE_URL'), '/');
        $bucket = env('SUPABASE_STORAGE_BUCKET', 'vehicle_images');

        $imageUrl = null;

        if (!empty($vehicle->image_path)) {
            $imageUrl = "{$baseUrl}/storage/v1/object/public/{$bucket}/{$vehicle->image_path}";
        }

        return [
            'id' => (string) $vehicle->id,
            'makeId' => (string) $vehicle->manufacturer_id,
            'make' => $vehicle->manufacturer->name ?? 'Unknown',
            'model' => $vehicle->model,
            'image' => $imageUrl,
            'image_path' => $vehicle->image_path,
        ];
    }
}