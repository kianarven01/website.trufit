<?php

namespace App\Domains\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $mapped = [];

        if ($this->has('sku') && !$this->has('SKU')) {
            $mapped['SKU'] = $this->input('sku');
        }

        if ($this->has('categoryId') && !$this->has('category_id')) {
            $mapped['category_id'] = $this->input('categoryId');
        }

        if ($this->has('partId') && !$this->has('part_id')) {
            $mapped['part_id'] = $this->input('partId');
        }

        if ($this->has('manufacturerId') && !$this->has('manufacturer_id')) {
            $mapped['manufacturer_id'] = $this->input('manufacturerId');
        }

        if ($this->has('partNumber') && !$this->has('part_number')) {
            $mapped['part_number'] = $this->input('partNumber');
        }

        if ($this->has('isOEM') && !$this->has('is_oem')) {
            $mapped['is_oem'] = $this->input('isOEM');
        }

        if ($this->has('oemRef') && !$this->has('oem_reference_number')) {
            $mapped['oem_reference_number'] = $this->input('oemRef');
        }

        if ($this->has('imagePath') && !$this->has('image_path')) {
            $mapped['image_path'] = $this->input('imagePath');
        }

        if ($mapped !== []) {
            $this->merge($mapped);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'SKU' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'image' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'category_id' => ['sometimes', 'nullable', 'integer'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:255'],
            'part_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_oem' => ['sometimes', 'boolean'],
            'oem_reference_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'unit' => ['sometimes', 'nullable', 'integer'],
            'part_id' => ['sometimes', 'nullable', 'integer'],
            'manufacturer_id' => ['sometimes', 'nullable', 'integer'],
            'preferred_supplier_id' => ['sometimes', 'nullable', 'string', 'uuid'],
            'auto_generate_sku' => ['sometimes', 'boolean'],
            'selling_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'conversion_factor' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'base_unit_id' => ['sometimes', 'nullable', 'integer'],
            'is_spol' => ['sometimes', 'boolean'],
            'item_type' => ['sometimes', 'nullable', 'string', 'in:part,spol'],
            'suppliers' => ['sometimes', 'nullable', 'array'],
            'suppliers.*.supplier_id' => ['required_with:suppliers', 'string'],
            'suppliers.*.supplier_cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
