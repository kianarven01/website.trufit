<?php

namespace App\Domains\Purchasing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['sometimes', 'uuid'],
            'order_date' => ['nullable', 'date'],
            'request_ship_date' => ['nullable', 'date'],
            'eta' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['required_with:items', 'uuid'],
            'items.*.product_supplier_id' => ['nullable', 'uuid'],
            'items.*.quantity_ordered' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $items = $this->input('items');
            if (is_array($items)) {
                $productIds = [];
                foreach ($items as $item) {
                    if (isset($item['product_id'])) {
                        $productIds[] = $item['product_id'];
                    }
                }
                if (count($productIds) !== count(array_unique($productIds))) {
                    $validator->errors()->add('items', 'Duplicate items are not allowed. Please combine duplicate items into a single line item.');
                }
            }
        });
    }
}
