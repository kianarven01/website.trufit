<?php

namespace App\Domains\Billing\Application\UseCases;

use App\Domains\Billing\Domain\Models\BillingStatement;

class CancelBillingStatement
{
    public function execute(string $billingId): BillingStatement
    {
        $statement = BillingStatement::findOrFail($billingId);

        if ($statement->salesOrder && $statement->salesOrder->Status !== 'CANCELLED') {
            throw new \RuntimeException(
                'Cannot cancel this billing statement directly because it is linked to an active Sales Order. Please cancel or void the Sales Order instead.',
                422
            );
        }

        $statement->update(['status' => 'Cancelled']);
        return $statement->fresh();
    }
}
