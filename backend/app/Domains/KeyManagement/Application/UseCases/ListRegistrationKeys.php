<?php

namespace App\Domains\KeyManagement\Application\UseCases;

use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\Employee\Http\Resources\OnboardingResource;

class ListRegistrationKeys
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