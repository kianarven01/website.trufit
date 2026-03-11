<?php

namespace App\Domains\Audit\Infrastructure\Repositories;

use App\Domains\Audit\Domain\Models\AuditLog;
use App\Domains\Audit\Domain\Repositories\AuditRepositoryInterface;

class EloquentAuditRepository implements AuditRepositoryInterface
{
    public function store(array $data): AuditLog
    {
        return AuditLog::create($data);
    }

    public function paginate(int $perPage = 50)
    {
        return AuditLog::with('actor')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getByEmployee(int $employeeId)
    {
        return AuditLog::where('employee_id', $employeeId)->orderBy('created_at', 'desc')->get();
    }

    public function getByTarget(string $type, string $id)
    {
        return AuditLog::where('auditable_type', $type)
            ->where('auditable_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}