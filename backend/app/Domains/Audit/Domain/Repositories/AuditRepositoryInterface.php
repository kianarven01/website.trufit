<?php

namespace App\Domains\Audit\Domain\Repositories;

use App\Domains\Audit\Domain\Models\AuditLog;

interface AuditRepositoryInterface
{
    public function store(array $data): AuditLog;
    public function paginate(int $perPage = 50);
    public function getByEmployee(int $employeeId);
    public function getByTarget(string $type, string $id);
}