<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Domain\Models\JobOrderTechnician;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AssignTechnician
{
    public function execute(string $jobOrderId, int $employeeId, string $role = 'PRIMARY'): JobOrderTechnician
    {
        return DB::transaction(function () use ($jobOrderId, $employeeId, $role) {
            $jobOrder = JobOrder::findOrFail($jobOrderId);

            // Check if tech is already actively assigned
            $existing = JobOrderTechnician::where('JobOrderID', $jobOrderId)
                ->where('employee_id', $employeeId)
                ->whereNull('removed_at')
                ->first();

            if ($existing) {
                throw new RuntimeException('Technician is already assigned to this job order.', 422);
            }

            return JobOrderTechnician::create([
                'JobOrderID' => $jobOrderId,
                'employee_id' => $employeeId,
                'role' => $role,
                'assigned_at' => now(),
            ]);
        });
    }
}
