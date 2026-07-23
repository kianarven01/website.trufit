<?php

namespace App\Domains\JobOrder\Application\UseCases;

use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\Billing\Application\UseCases\CreateBillingStatement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CompleteJobOrder
{
    public function __construct(
        private readonly CreateBillingStatement $createBillingStatement
    ) {}

    public function execute(string $id, ?string $userId = null): JobOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $jobOrder = JobOrder::lockForUpdate()->findOrFail($id);

            // Load services with service type names directly
            $services = \App\Domains\JobOrder\Domain\Models\JobOrderService::where('JobOrderID', $id)
                ->with('serviceType')
                ->get();
            $jobOrder->setRelation('services', $services);

            // Load estimate for customer_id
            if ($jobOrder->estimate_id) {
                $jobOrder->load('estimate');
            }

            // Build billing items from JO services
            $billingItems = [];
            $grandTotal = 0.0;

            foreach ($jobOrder->services as $joService) {
                $serviceName = $joService->custom_name ?? $joService->serviceType->name ?? 'Service';
                $price = (float) ($joService->PriceAtSale ?? 0);
                $billingItems[] = [
                    'name' => $serviceName,
                    'qty' => 1,
                    'price' => $price,
                    'amount' => $price,
                    'type' => 'service',
                ];
                $grandTotal += $price;
            }

            // Check if billing statement already exists
            $billExists = \App\Domains\Billing\Domain\Models\BillingStatement::where('JOID', $jobOrder->id)
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if (!$billExists) {
                $customerId = $jobOrder->estimate?->customer_id ?? $jobOrder->salesOrder?->customerID;
                if ($customerId) {
                    $this->createBillingStatement->execute([
                        'customer_id' => $customerId,
                        'jo_id' => $jobOrder->id,
                        'date' => now(),
                        'total' => $grandTotal,
                        'tax' => 0,
                        'vehicle_id' => $jobOrder->vehicle_id_new,
                        'notes' => 'Automatically generated billing statement from Completed Job Order ' . ($jobOrder->jo_number ?? $jobOrder->id),
                        'items' => $billingItems,
                        'created_by' => $userId,
                    ]);
                }
            }

            return $jobOrder->fresh();
        });
    }
}
