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

            // Calculate accumulated time using timer-active time only
            // Uses elapsed_seconds (which includes running session time) as the current timer position
            $timerTotal = $jobOrder->elapsed_seconds;
            $baseline = $assignment->timer_baseline ?? 0;
            $accumulated = max(0, $timerTotal - $baseline);

            $assignment->update([
                'removed_at' => now(),
                'accumulated_seconds' => $accumulated,
            ]);

            return $assignment->fresh();
        });
    }
}
