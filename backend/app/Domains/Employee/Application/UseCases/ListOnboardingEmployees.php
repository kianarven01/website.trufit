<?php

namespace App\Domains\Employee\Application\UseCases;

use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\Employee\Http\Resources\OnboardingResource;

class ListOnboardingEmployees
{
    public function __construct(protected RegistrationKeyRepository $repository) {}

    public function execute(): array
    {
        $keys = $this->repository->getAll();

        return [
            'status' => 'success',
            'data' => OnboardingResource::collection($keys)
        ];
    }
}