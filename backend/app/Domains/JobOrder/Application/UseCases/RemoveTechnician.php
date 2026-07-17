<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Domain\Models\JobOrderTechnician;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RemoveTechnician
{
    public function execute(string $jobOrderId, int $technicianId): JobOrderTechnician
    {
        return DB::transaction(function () use ($jobOrderId, $technicianId) {
            $assignment = JobOrderTechnician::where('JobOrderID', $jobOrderId)
                ->where('employee_id', $technicianId)
                ->whereNull('removed_at')
                ->first();

            if (!$assignment) {
                throw new RuntimeException('Technician is not actively assigned to this job order.', 422);
            }

            $jobOrder = JobOrder::findOrFail($jobOrderId);

            // Calculate accumulated time if JO timer was running during this assignment
            $accumulated = $assignment->accumulated_seconds ?? 0;

            if ($jobOrder->timer_status === 'running' && $assignment->assigned_at) {
                // Add time from assignment to now (if timer was running during this period)
                $elapsed = (int) now()->diffInSeconds($assignment->assigned_at, false);
                $accumulated += max(0, $elapsed);
            }

            $assignment->update([
                'removed_at' => now(),
                'accumulated_seconds' => $accumulated,
            ]);

            return $assignment->fresh();
        });
    }
}
