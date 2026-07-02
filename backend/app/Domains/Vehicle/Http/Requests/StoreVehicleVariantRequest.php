<?php

namespace App\Domains\Vehicle\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_name' => ['required', 'string', 'max:255'],
            'engine_displacement' => ['nullable', 'string', 'max:50'],
            'year' => ['required', 'string', 'max:50'],
            'transmission_type' => ['nullable', 'string', 'max:50'],
            'drivetrain' => ['nullable', 'string', 'max:50'],
            'oil_capacity' => ['nullable', 'integer', 'min:0'],
            'service_class' => ['nullable', 'string', 'max:100'],
            'fuel_type' => ['nullable', 'string', 'max:50'],
            'body_type' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'variant_name' => is_string($this->variant_name) ? trim($this->variant_name) : $this->variant_name,
            'engine_displacement' => is_string($this->engine_displacement) ? trim($this->engine_displacement) : $this->engine_displacement,
            'transmission_type' => is_string($this->transmission_type) ? trim($this->transmission_type) : $this->transmission_type,
            'service_class' => is_string($this->service_class) ? trim($this->service_class) : $this->service_class,
            'drivetrain' => is_string($this->drivetrain) ? trim($this->drivetrain) : $this->drivetrain,
        ]);
    }
}