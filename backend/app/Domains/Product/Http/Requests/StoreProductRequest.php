<?php

namespace App\Domains\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'SKU' => ['required', 'string', 'max:255', Rule::unique('Main.Products', 'SKU')],
            'cost' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],

            'image_path' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'],

            'category_id' => ['nullable', 'integer'],
            'unit' => ['nullable', 'integer'],
            'manufacturer_id' => ['nullable', 'integer'],

            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('Main.Products', 'barcode')],
            'part_number' => ['required', 'string', 'max:255'],
            'part_id' => ['nullable', 'integer'],

            'is_oem' => ['nullable', 'boolean'],
            'oem_reference_number' => ['nullable', 'string', 'max:255'],

            'car_variant_id' => ['nullable', 'integer'],
            'compatibility_notes' => ['nullable', 'string'],
        ];
    }
}