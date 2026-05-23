<?php

namespace App\Domains\Product\Application\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Exception;

class ProductImageUploader
{
    public function upload(UploadedFile $file): string
    {
        $supabaseUrl = rtrim(env('SUPABASE_URL'), '/');
        $serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
        $bucket = env('SUPABASE_PRODUCT_BUCKET', 'product_images');

        if (!$supabaseUrl || !$serviceKey) {
            throw new Exception('Supabase storage is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
        }

        $extension = $file->getClientOriginalExtension();
        $filePath = 'products/product_' . uniqid('', true) . '.' . $extension;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $serviceKey,
            'apikey' => $serviceKey,
            'Content-Type' => $file->getMimeType(),
            'x-upsert' => 'true',
        ])
            ->withBody(
                file_get_contents($file->getRealPath()),
                $file->getMimeType()
            )
            ->post("{$supabaseUrl}/storage/v1/object/{$bucket}/{$filePath}");

        if (!$response->successful()) {
            throw new Exception(
                'Image upload to Supabase failed: ' . $response->status() . ' - ' . $response->body()
            );
        }

        return "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$filePath}";
    }
}