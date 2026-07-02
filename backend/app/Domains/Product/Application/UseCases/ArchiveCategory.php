<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\ArchiveCategoryDTO;
use App\Domains\Product\Application\Services\CategoryArchiveService;

class ArchiveCategory
{
    public function __construct(
        private readonly CategoryArchiveService $categoryArchiveService,
    ) {
    }

    public function execute(ArchiveCategoryDTO $dto): array
    {
        return $this->categoryArchiveService->archive($dto->categoryId);
    }
}