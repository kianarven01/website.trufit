<?php

namespace App\Domains\Employee\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Domains\Employee\Application\UseCase\ListEmployees;

class EmployeeController extends Controller

{
public function index(ListEmployees $useCase)
    {
        return response()->json($useCase->execute());
    }

}

