<?php

namespace App\Domains\Employee\Application\UseCase;

use App\Domains\Employee\Infrastructure\Repositories\EmployeeRepository;
use App\Domains\Employee\Http\Resources\EmployeeResource;

class ListEmployees
{
    public function __construct(protected EmployeeRepository $employeeRepo) {}

    public function execute(): array
    {
        $employees = $this->employeeRepo->getAllActive();

        return [
            'status' => 'success',
            'data' => EmployeeResource::collection($employees)
        ];
    }
}