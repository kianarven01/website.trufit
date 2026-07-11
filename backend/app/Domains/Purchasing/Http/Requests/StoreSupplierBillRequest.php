<?php

namespace App\Domains\Purchasing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bill_number' => 'required|string',
            'purchase_order_id' => 'required|uuid',
            'bill_date' => 'required|date',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|uuid',
            'items.*.quantity_billed' => 'required|integer|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }
}
