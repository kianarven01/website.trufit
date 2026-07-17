<?php

namespace App\Domains\Billing\Application\UseCases;

use App\Domains\Billing\Domain\Models\BillingStatement;
use App\Domains\Billing\Domain\Models\Payment;
use Illuminate\Support\Facades\DB;

class AddPaymentToBillingStatement
{
    public function execute(string $billingId, array $paymentData): BillingStatement
    {
        return DB::transaction(function () use ($billingId, $paymentData) {
            $statement = BillingStatement::findOrFail($billingId);

            Payment::create([
                'BillingID' => $statement->id,
                'Amount' => $paymentData['amount'],
                'Date' => now(),
                'PaymentMethod' => $paymentData['method'],
                'ReferenceNumber' => $paymentData['reference_number'] ?? null,
                'Type' => $paymentData['type'] ?? 'partial',
            ]);

            $totalPaid = (float)$statement->payments()->sum('Amount');
            $totalCost = (float)$statement->Total;

            if ($totalPaid >= $totalCost) {
                $statement->update(['status' => 'Paid']);
                if ($statement->SOID) {
                    DB::connection('pgsql')
                        ->table('Main.SalesOrder')
                        ->where('id', $statement->SOID)
                        ->whereNotIn('Status', ['COMPLETED', 'CANCELLED'])
                        ->update([
                            'Status' => 'COMPLETED',
                            'completed_at' => now(),
                        ]);
                }
            } elseif ($totalPaid > 0) {
                $statement->update(['status' => 'Partially Paid']);
            } else {
                $statement->update(['status' => 'Unpaid']);
            }

            return $statement->fresh(['payments']);
        });
    }
}
