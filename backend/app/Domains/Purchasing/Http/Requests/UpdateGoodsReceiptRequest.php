<?php

namespace App\Domains\Purchasing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => 'nullable|string',
            'allow_over_receiving' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|uuid',
            'items.*.quantity_received' => 'required|integer|min:0',
            'items.*.quantity_rejected' => 'nullable|integer|min:0',
            'items.*.quantity_promo' => 'nullable|integer|min:0',
            'items.*.notes' => 'nullable|string',
        ];
    }
}
