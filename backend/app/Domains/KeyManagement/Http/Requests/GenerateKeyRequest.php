<?php

namespace App\Domains\KeyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateKeyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // You can check policies here later
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => [
                'required',
                'email',
                'unique:Employees,email',
                'unique:RegistrationKeys,email,NULL,id,is_used,0' // Email must be unique among UNUSED keys
            ],
            'phone'      => 'nullable|string',
            'address'    => 'nullable|string',
            'position'   => 'required|string',
            'role_id'    => 'required|exists:Roles,id',
        ];
    }

    /**
     * Custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered or has a pending registration key.',
            'role_id.exists' => 'The selected system role is invalid.',
        ];
    }
}