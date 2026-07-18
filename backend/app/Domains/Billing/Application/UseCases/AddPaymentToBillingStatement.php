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

            if ($statement->status === 'Paid') {
                throw new \Exception('This bill is already fully paid.');
            }
            if ($statement->status === 'Cancelled') {
                throw new \Exception('Cannot record payment against a cancelled bill.');
            }
            if ($statement->status === 'Void') {
                throw new \Exception('Cannot record payment against a void bill.');
            }

            $effectiveTotal = $statement->effective_total;
            $totalPaid = (float) $statement->payments()->sum('Amount');
            $remaining = $effectiveTotal - $totalPaid;
            $amount = (float) $paymentData['amount'];

            if ($amount > $remaining) {
                throw new \Exception(
                    "Payment exceeds remaining balance. Remaining: " . number_format($remaining, 2) . ", Attempted: " . number_format($amount, 2)
                );
            }

            Payment::create([
                'BillingID' => $statement->id,
                'Amount' => $paymentData['amount'],
                'Date' => now(),
                'PaymentMethod' => $paymentData['method'],
                'ReferenceNumber' => $paymentData['reference_number'] ?? null,
                'Type' => $paymentData['type'] ?? 'partial',
                'recorded_by' => $paymentData['recorded_by'] ?? null,
            ]);

            $totalPaid += $amount;

            if ($totalPaid >= $effectiveTotal) {
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
