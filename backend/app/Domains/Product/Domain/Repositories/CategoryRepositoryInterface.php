<?php

namespace App\Domains\Product\Domain\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    public function all(): Collection;
}
