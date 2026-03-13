<?php

namespace App\Domains\Shared\Domain\Services;

interface AuditServiceInterface
{
    /**
     * Log a general event.
     */
    public function log(
        string $eventType,
        string $action,
        ?int $employeeId = null,
        ?string $targetType = null,
        ?string $targetId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void;

    /**
     * Specifically log security-related events.
     */
    public function logSecurity(string $action, ?int $employeeId = null, ?array $meta = null): void;

    /**
     * Specifically log data-related changes.
     */
    public function logDataChange(string $targetType, string $targetId, array $old, array $new, ?int $employeeId = null): void;
}