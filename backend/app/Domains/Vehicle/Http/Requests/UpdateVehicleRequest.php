<?php

namespace App\Domains\Vehicle\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'manufacturer_id' => 'required|uuid',
            'model'           => 'required|string|max:100',
            'image_url'       => 'nullable|string',
        ];
    }
}
