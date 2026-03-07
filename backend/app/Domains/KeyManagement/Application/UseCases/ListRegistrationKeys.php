<?php

namespace App\Domains\KeyManagement\Application\UseCases;

use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\Employee\Http\Resources\OnboardingResource;

class ListRegistrationKeys
{
    public function __construct(protected RegistrationKeyRepository $repository) {}

    public function execute(string $status = 'all'): array
    {
        // Pass the filter to the repository
        $keys = $this->repository->getAll($status); 

        return [
            'status' => 'success',
            // Your existing OnboardingResource handles the JSON transformation
            'data' => OnboardingResource::collection($keys)
        ];
    }
}