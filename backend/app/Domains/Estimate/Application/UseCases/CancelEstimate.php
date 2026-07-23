<?php

namespace App\Domains\Estimate\Application\UseCases;

use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\UseCases\CancelSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\VoidSalesOrder;
use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Application\UseCases\StopTimer;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CancelEstimate
{
    public function __construct(
        private readonly CancelSalesOrder $cancelSalesOrder,
        private readonly VoidSalesOrder $voidSalesOrder,
    ) {}

    public function execute(string $estimateId, ?string $userId = null): array
    {
        return DB::transaction(function () use ($estimateId, $userId) {
            $estimate = Estimate::lockForUpdate()->findOrFail($estimateId);
            $upperStatus = strtoupper($estimate->status ?? '');

            // Guard: only DRAFT, FOR APPROVAL, or APPROVED (with or without downpayment) can be cancelled
            if (!in_array($upperStatus, ['DRAFT', 'FOR APPROVAL', 'FOR_APPROVAL', 'APPROVED', 'APPROVED WITH DOWNPAYMENT', 'APPROVED_WITH_DOWNPAYMENT'])) {
                throw new RuntimeException('This estimate cannot be cancelled.', 422);
            }

            // For APPROVED estimates, check conditions before cascading
            if (in_array($upperStatus, ['APPROVED', 'APPROVED WITH DOWNPAYMENT', 'APPROVED_WITH_DOWNPAYMENT'])) {
                $this->checkApprovalConditions($estimateId);
            }

            // Find linked SO and JO
            $so = SalesOrder::where('estimate_id', $estimateId)->first();
            $jo = $so
                ? JobOrder::where('SaleOrderID', $so->id)->first()
                : JobOrder::where('estimate_id', $estimateId)->first();

            // Cascade: Cancel SO (handles billing + inventory unreservation)
            if ($so) {
                $oldStatus = $so->Status;
                if (in_array($oldStatus, ['APPROVED', 'IN_PROGRESS']) && $so->items()->where('is_issued', true)->exists()) {
                    // Items were issued — need to void (return stock) instead of just cancel
                    $this->voidSalesOrder->execute($so->id, $userId);
                } else {
                    $this->cancelSalesOrder->execute($so->id, $userId);
                }
            }

            // Cascade: Cancel JO (stop timer, set Cancelled status)
            if ($jo) {
                $currentStatusName = $jo->statusRecord->name ?? null;
                if (in_array($currentStatusName, ['Pending', 'In Progress'])) {
                    // Stop timer if running
                    if ($jo->timer_status) {
                        app(StopTimer::class)->execute($jo->id);
                    }

                    // Set JO status to Cancelled
                    $cancelledStatusId = $this->getJoStatusId('Cancelled');
                    $jo->update(['status' => $cancelledStatusId]);
                }
            }

            // Set estimate status to CANCELLED
            $estimate->update(['status' => 'CANCELLED']);

            $messages = [];
            if ($so) $messages[] = 'SO ' . $so->so_number;
            if ($jo) $messages[] = 'JO ' . $jo->jo_number;
            $summary = !empty($messages) ? implode(' and ', $messages) . ' cancelled.' : '';

            return [
                'estimate' => $estimate->fresh(),
                'message' => 'Estimate cancelled.' . ($summary ? ' ' . $summary : ''),
            ];
        });
    }

    /**
     * Check if the estimate can be safely cancelled after approval.
     * Throws if any condition prevents cancellation.
     */
    private function checkApprovalConditions(string $estimateId): void
    {
        $so = SalesOrder::where('estimate_id', $estimateId)->first();
        if (!$so) return;

        // Check if any items are issued
        if ($so->items()->where('is_issued', true)->exists()) {
            throw new RuntimeException(
                'Cannot cancel: items have been issued. Return issued items from the Sales Order first.',
                422
            );
        }

        // Check linked JO conditions
        $jo = JobOrder::where('SaleOrderID', $so->id)->first();
        if ($jo) {
            // Check if timer is active
            if (in_array($jo->timer_status, ['running', 'paused'])) {
                throw new RuntimeException(
                    'Cannot cancel: the Job Order timer is running. Stop the timer first.',
                    422
                );
            }

            // Check if work has started (JO is In Progress)
            $joStatusName = $jo->statusRecord->name ?? null;
            if ($joStatusName === 'In Progress') {
                throw new RuntimeException(
                    'Cannot cancel: work is in progress on the Job Order. Cancel the Job Order first.',
                    422
                );
            }

            if ($joStatusName === 'Completed') {
                throw new RuntimeException(
                    'Cannot cancel: the Job Order has been completed. Cancel the Sales Order and Job Order individually.',
                    422
                );
            }
        }

        // Check SO status
        if ($so->Status === 'COMPLETED') {
            throw new RuntimeException(
                'Cannot cancel: the Sales Order has been completed. Cancel it individually.',
                422
            );
        }
    }

    private function getJoStatusId(string $name): string
    {
        $status = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', $name)
            ->where('category', 'JOB_ORDER')
            ->first();

        if (!$status) {
            throw new RuntimeException("Status \"{$name}\" not found for JOB_ORDER category.");
        }

        return $status->id;
    }
}
