<?php

namespace App\Domains\Audit\Application\UseCases;

use App\Domains\Audit\Domain\Repositories\AuditRepositoryInterface;
use App\Domains\Audit\Http\Resources\AuditLogResource;

class ListAuditLogs
{
    public function __construct(protected AuditRepositoryInterface $repository) {}

    public function execute(int $perPage = 50)
    {
        $logs = $this->repository->paginate($perPage);

        return AuditLogResource::collection($logs);
    }
}