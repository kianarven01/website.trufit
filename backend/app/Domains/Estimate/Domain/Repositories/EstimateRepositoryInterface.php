<?php

namespace App\Domains\Estimate\Domain\Repositories;

use App\Domains\Estimate\Domain\Models\Estimate;

interface EstimateRepositoryInterface
{
    public function getAll();
    public function findById(string $id): ?Estimate;
    public function create(array $data): Estimate;
    public function update(string $id, array $data): Estimate;
    public function delete(string $id): bool;
}
