<?php

namespace App\Domains\Employee\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Domains\Employee\Application\UseCases\ListEmployees;
use App\Domains\KeyManagement\Application\UseCases\ListRegistrationKeys;

class EmployeeController extends Controller

{
    public function index(ListEmployees $useCase)
        {
            return response()->json($useCase->execute());
        }

    public function onboarding(ListRegistrationKeys $useCase)
    {
        // The controller in the Employee domain "asks" the KeyManagement domain for data
        return response()->json($useCase->execute());
    }

}

