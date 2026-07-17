<?php

namespace App\Domains\Billing\Application\UseCases;

use App\Domains\Billing\Domain\Models\BillingStatement;
use App\Domains\Billing\Domain\Models\BillingStatementItem;
use App\Domains\Billing\Domain\Models\Payment;
use Illuminate\Support\Facades\DB;

class CreateBillingStatement
{
    public function execute(array $data): BillingStatement
    {
        return DB::transaction(function () use ($data) {
            $billNumber = $this->generateBillNumber();

            $billingStatement = BillingStatement::create([
                'CustomerID' => $data['customer_id'],
                'SOID' => $data['so_id'] ?? null,
                'JOID' => $data['jo_id'] ?? null,
                'Date' => $data['date'] ?? now(),
                'Total' => $data['total'],
                'status' => 'Unpaid',
                'bill_number' => $billNumber,
                'vehicle_id' => $data['vehicle_id'] ?? null,
                'tax' => $data['tax'] ?? 0,
                'notes' => $data['notes'] ?? null,
            ]);

            // Persist line items
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $qty = (int) ($item['qty'] ?? 1);
                    $price = (float) ($item['price'] ?? 0);
                    $amount = (float) ($item['amount'] ?? ($qty * $price));

                    BillingStatementItem::create([
                        'BillingStatementID' => $billingStatement->id,
                        'name' => $item['name'] ?? 'Unknown',
                        'quantity' => $qty,
                        'UnitPrice' => $price,
                        'SubTotal' => $amount,
                        'type' => $item['type'] ?? 'part',
                    ]);
                }
            }

            // Handle optional initial payment
            if (isset($data['payment']) && is_array($data['payment'])) {
                $pay = $data['payment'];
                $amount = (float)($pay['amount'] ?? 0);

                if ($amount > 0) {
                    Payment::create([
                        'BillingID' => $billingStatement->id,
                        'Amount' => $amount,
                        'Date' => now(),
                        'PaymentMethod' => $pay['method'] ?? 'Cash',
                        'ReferenceNumber' => $pay['reference_number'] ?? null,
                        'Type' => $pay['type'] ?? 'partial',
                    ]);

                    if ($amount >= (float)$billingStatement->Total) {
                        $billingStatement->update(['status' => 'Paid']);
                        if ($billingStatement->SOID) {
                            DB::connection('pgsql')
                                ->table('Main.SalesOrder')
                                ->where('id', $billingStatement->SOID)
                                ->whereNotIn('Status', ['COMPLETED', 'CANCELLED'])
                                ->update([
                                    'Status' => 'COMPLETED',
                                    'completed_at' => now(),
                                ]);
                        }
                    } else {
                        $billingStatement->update(['status' => 'Partially Paid']);
                    }
                }
            }

            return $billingStatement;
        });
    }

    private function generateBillNumber(): string
    {
        $prefix = 'BILL-' . date('ymd') . '-';
        do {
            $number = $prefix . str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (BillingStatement::where('bill_number', $number)->exists());

        return $number;
    }
}
