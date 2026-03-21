<?php

namespace App\Domains\Vehicle\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_name' => ['required', 'string', 'max:255'],
            'engine_displacement' => ['nullable', 'integer', 'min:0'],
            'year_start' => ['required', 'integer', 'min:1900', 'max:2100'],
            'year_end' => ['nullable', 'integer', 'min:1900', 'max:2100', 'gte:year_start'],
            'transmission_type' => ['nullable', 'string', 'max:50'],
            'oil_capacity' => ['nullable', 'integer', 'min:0'],
            'service_class' => ['nullable', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'variant_name' => is_string($this->variant_name) ? trim($this->variant_name) : $this->variant_name,
            'transmission_type' => is_string($this->transmission_type) ? trim($this->transmission_type) : $this->transmission_type,
            'service_class' => is_string($this->service_class) ? trim($this->service_class) : $this->service_class,
        ]);
    }
}