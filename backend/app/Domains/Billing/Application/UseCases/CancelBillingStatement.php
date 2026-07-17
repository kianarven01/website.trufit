<?php

namespace App\Domains\Billing\Application\UseCases;

use App\Domains\Billing\Domain\Models\BillingStatement;

class CancelBillingStatement
{
    public function execute(string $billingId): BillingStatement
    {
        $statement = BillingStatement::findOrFail($billingId);
        $statement->update(['status' => 'Cancelled']);
        return $statement->fresh();
    }
}
