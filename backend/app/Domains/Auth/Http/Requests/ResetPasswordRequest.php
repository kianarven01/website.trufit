<?php

namespace App\Domains\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    protected $table = 'Main.Employees';

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:Employees,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}