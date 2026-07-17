<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PauseTimer
{
    public function execute(string $id): JobOrder
    {
        return DB::transaction(function () use ($id) {
            $jobOrder = JobOrder::lockForUpdate()->findOrFail($id);

            if ($jobOrder->timer_status !== 'running') {
                throw new RuntimeException('Timer is not running.', 422);
            }

            // Calculate elapsed for this session and add to total
            $elapsed = 0;
            if ($jobOrder->timer_started_at) {
                $elapsed = (int) now()->diffInSeconds($jobOrder->timer_started_at, false);
                $elapsed = max(0, $elapsed);
            }

            $jobOrder->update([
                'timer_status' => 'paused',
                'timer_total_seconds' => ($jobOrder->timer_total_seconds ?? 0) + $elapsed,
                'timer_started_at' => null,
            ]);

            return $jobOrder->fresh();
        });
    }
}
