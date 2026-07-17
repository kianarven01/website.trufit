<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StartTimer
{
    public function execute(string $id): JobOrder
    {
        return DB::transaction(function () use ($id) {
            $jobOrder = JobOrder::lockForUpdate()->findOrFail($id);

            if ($jobOrder->statusRecord->name !== 'In Progress') {
                throw new RuntimeException('Timer can only be started on in-progress job orders.', 422);
            }

            if ($jobOrder->timer_status === 'running') {
                throw new RuntimeException('Timer is already running.', 422);
            }

            $jobOrder->update([
                'timer_status' => 'running',
                'timer_started_at' => now(),
            ]);

            return $jobOrder->fresh();
        });
    }
}
