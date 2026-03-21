<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Domain\Repositories\CategoryRepositoryInterface;

class GetCategories
{
    public function __construct(private CategoryRepositoryInterface $repository) {}

    public function execute(): array
    {
        return $this->repository->all()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'code' => $category->code,
            ])
            ->toArray();
    }
}
