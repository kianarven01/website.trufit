<?php

namespace App\Domains\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->user()->employeeID;
        return [
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('Employees', 'email')->ignore($employeeId)
            ],
        ];
    }
}