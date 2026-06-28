<?php

namespace App\Domains\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

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
            'SKU' => ['nullable', 'string', 'max:255'],
            
            'description' => ['nullable', 'string'],

            'image_path' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'],

            'category_id' => ['nullable', 'integer'],
            'unit' => ['nullable', 'integer'],
            'manufacturer_id' => ['nullable', 'integer'],

            'barcode' => ['nullable', 'string', 'max:255'],
            'part_number' => ['required', 'string', 'max:255'],
            'part_id' => ['nullable', 'integer'],

            'is_oem' => ['nullable', 'boolean'],
            'oem_reference_number' => ['nullable', 'string', 'max:255'],

            'car_variant_id' => ['nullable', 'integer'],
            'compatibility_notes' => ['nullable', 'string'],

            'suppliers' => ['nullable', 'array'],
            'suppliers.*.supplier_id' => ['required_with:suppliers', 'uuid', 'distinct'],
            'suppliers.*.supplier_cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $sku = $this->input('SKU');
            $barcode = $this->input('barcode');

            if ($sku && DB::table('Main.Products')->where('SKU', $sku)->exists()) {
                $validator->errors()->add('SKU', 'The SKU has already been taken.');
            }

            if ($barcode && DB::table('Main.Products')->where('barcode', $barcode)->exists()) {
                $validator->errors()->add('barcode', 'The barcode has already been taken.');
            }
        });
    }
}