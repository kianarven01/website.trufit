<?php

namespace App\Domains\Audit\Infrastructure\Services;

use App\Domains\Shared\Domain\Services\AuditServiceInterface;
use App\Domains\Audit\Domain\Repositories\AuditRepositoryInterface;
use Illuminate\Support\Facades\Request;

use Illuminate\Support\Facades\Log;

class AuditService implements AuditServiceInterface
{
    public function __construct(protected AuditRepositoryInterface $repository) {}

    public function log(
        string $eventType,
        string $action,
        ?int $employeeId = null,
        ?string $targetType = null,
        ?string $targetId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        // Resolve the real Employee ID if none provided
        if (!$employeeId && auth()->check()) {
            $employeeId = auth()->user()->employeeID;
        }

        $data = [
            'employee_id' => $employeeId,
            'event_type' => $eventType,
            'action' => $action,
            'auditable_type' => $targetType,
            'auditable_id' => $targetId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ];

        // 1. Save to Database (Permanent ERP Record)
        $this->repository->store($data);

        // 2. Save to Text File (Easy Inspection)
        $logMessage = sprintf(
            "[%s] %s | %s | Actor ID: %s | Target: %s#%s | IP: %s",
            $data['created_at']->format('Y-m-d H:i:s'),
            str_pad($data['event_type'], 10),
            str_pad($data['action'], 20),
            $data['employee_id'] ?? 'SYSTEM',
            $data['auditable_type'] ?? 'N/A',
            $data['auditable_id'] ?? 'N/A',
            $data['ip_address']
        );

        Log::build([
            'driver' => 'single',
            'path' => storage_path('logs/audits.log'),
        ])->info($logMessage, [
            'before' => $data['old_values'],
            'after' => $data['new_values']
        ]);
    }

    public function logSecurity(string $action, ?int $employeeId = null, ?array $meta = null): void
    {
        $this->log('SECURITY', $action, $employeeId, null, null, null, $meta);
    }

    public function logDataChange(string $targetType, string $targetId, array $old, array $new, ?int $employeeId = null): void
    {
        $this->log('DATA_CHANGE', 'UPDATE', $employeeId, $targetType, $targetId, $old, $new);
    }
}