<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StopTimer
{
    public function execute(string $id): JobOrder
    {
        return DB::transaction(function () use ($id) {
            $jobOrder = JobOrder::lockForUpdate()->findOrFail($id);

            if ($jobOrder->timer_status !== 'running' && $jobOrder->timer_status !== 'paused') {
                throw new RuntimeException('Timer is not active.', 422);
            }

            // Calculate elapsed for current session if running
            $elapsed = 0;
            if ($jobOrder->timer_status === 'running' && $jobOrder->timer_started_at) {
                $startedAt = Carbon::parse($jobOrder->timer_started_at);
                $elapsed = (int) abs(Carbon::now()->diffInSeconds($startedAt));
            }

            $jobOrder->update([
                'timer_status' => null,
                'timer_total_seconds' => ($jobOrder->timer_total_seconds ?? 0) + $elapsed,
                'timer_started_at' => null,
            ]);

            return $jobOrder->fresh();
        });
    }
}
