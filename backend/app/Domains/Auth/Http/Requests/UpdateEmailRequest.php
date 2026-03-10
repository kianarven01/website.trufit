<?php

namespace App\Domains\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'email' => 'required|email|max:255|unique:Main.Employees,email,' . $employeeId,
        ];
    }
}