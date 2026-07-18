<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Billing Statement {{ $billing->bill_number }}</title>
    <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9px;
            margin: 0; padding: 0;
            color: #1a1a2e;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 3px solid #c41e3a; }
        .company-info { flex: 1; }
        .company-name { font-size: 18px; font-weight: bold; color: #c41e3a; margin: 0 0 3px 0; }
        .company-details { font-size: 8px; color: #555; line-height: 1.4; }
        .title-section { text-align: right; }
        .title { font-size: 20px; font-weight: bold; color: #c41e3a; margin: 0; text-transform: uppercase; }
        .title-meta { font-size: 9px; color: #333; margin-top: 4px; line-height: 1.5; }
        .title-meta strong { color: #c41e3a; }
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #333; }
        .info-grid td { border: 1px solid #333; padding: 3px 5px; font-size: 8px; vertical-align: top; }
        .info-grid .label { font-size: 7px; color: #666; text-transform: uppercase; font-weight: bold; }
        .info-grid .value { font-size: 8.5px; font-weight: bold; min-height: 12px; }
        .info-grid .section-header { background: #f0f0f0; font-weight: bold; text-align: center; font-size: 7px; text-transform: uppercase; }
        .payment-method { display: flex; align-items: center; gap: 6px; font-size: 8px; }
        .payment-method .checkbox { display: inline-block; width: 10px; height: 10px; border: 1px solid #333; margin-right: 2px; vertical-align: middle; }
        .payment-method .checked { background: #333; }
        .items-section { margin-bottom: 10px; }
        .items-section .section-title { font-size: 10px; font-weight: bold; color: #c41e3a; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
        .items-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 8px; }
        .items-table th { background: #c41e3a; color: #fff; padding: 4px 6px; font-size: 8px; text-transform: uppercase; text-align: left; font-weight: 600; }
        .items-table th.num { text-align: right !important; }
        .items-table th.cnt { text-align: center !important; }
        .items-table td { padding: 4px 6px; border-bottom: 1px solid #eee; font-size: 8.5px; }
        .items-table td.num { text-align: right !important; font-variant-numeric: tabular-nums; }
        .items-table td.cnt { text-align: center !important; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .empty-row td { padding: 8px 6px; color: #999; font-style: italic; text-align: center; font-size: 8px; }
        .comments { margin-bottom: 12px; }
        .comments .label { font-size: 9px; font-weight: bold; color: #c41e3a; text-transform: uppercase; margin-bottom: 3px; }
        .comments .value { font-size: 8.5px; color: #333; min-height: 15px; border: 1px solid #ddd; padding: 4px 6px; border-radius: 2px; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 12px; }
        .totals-table { width: 260px; border-collapse: collapse; }
        .totals-table td { padding: 3px 6px; font-size: 9px; }
        .totals-table .label { text-align: right; color: #555; padding-right: 10px; }
        .totals-table .value { text-align: right; font-weight: bold; font-variant-numeric: tabular-nums; }
        .totals-table .grand td { border-top: 2px solid #c41e3a; padding-top: 5px; font-size: 11px; color: #c41e3a; }
        .legal { margin-bottom: 12px; font-size: 7.5px; color: #555; line-height: 1.4; border: 1px solid #ddd; padding: 6px 8px; border-radius: 2px; }
        .signatures { display: flex; justify-content: space-between; gap: 40px; margin-top: 15px; padding-top: 10px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-bottom: 1px solid #333; padding-bottom: 3px; font-size: 9px; font-weight: bold; color: #1a1a2e; margin-bottom: 2px; min-height: 18px; }
        .sig-label { font-size: 8px; color: #555; }
        .footer { text-align: center; font-size: 7.5px; color: #c41e3a; font-weight: bold; margin-top: 12px; padding-top: 6px; border-top: 1px solid #eee; }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        <div class="company-info">
            @php
                $logoPath = public_path('images/logo-white1.webp');
                $logoData = '';
                if (file_exists($logoPath)) {
                    $logoData = 'data:image/webp;base64,' . base64_encode(file_get_contents($logoPath));
                }
            @endphp
            @if($logoData)
                <img src="{{ $logoData }}" alt="Trufit" style="height: 40px; margin-bottom: 4px;">
            @else
                <div class="company-name">TRUFIT</div>
            @endif
            <div class="company-name" style="font-size: 12px;">TRUFIT Trading and Services Corp.</div>
            <div class="company-details">
                1042 Vinzons Ave. P1 Brgy. Gahonon<br>
                Daet, Camarines Norte, Philippines<br>
                Tel: 09187747788 / 09757210388<br>
                Email: trufitautocenter@gmail.com
            </div>
        </div>
        <div class="title-section">
            <div class="title">Billing Statement</div>
            <div class="title-meta">
                <strong>Bill #:</strong> {{ $billing->bill_number }}<br>
                <strong>JO No.:</strong> {{ $billing->jobOrder->jo_number ?? '—' }}<br>
                <strong>Date:</strong> {{ $billing->Date ? \Carbon\Carbon::parse($billing->Date)->format('M d, Y') : '' }}
            </div>
        </div>
    </div>

    {{-- Info Grid --}}
    @php
        $customer = $billing->customer;
        $vehicle = $billing->vehicle;
        $so = $billing->salesOrder;
    @endphp
    <table class="info-grid">
        <tr>
            <td style="width: 25%">
                <div class="label">Plate No.</div>
                <div class="value">{{ $vehicle->plate_number ?? '—' }}</div>
            </td>
            <td style="width: 35%">
                <div class="label">Customer Name & Address</div>
                <div class="value">{{ trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')) }}</div>
                <div style="font-size: 7.5px;">{{ $customer->address ?? '' }}</div>
            </td>
            <td style="width: 20%">
                <div class="label">Home Phone No.</div>
                <div class="value">{{ $customer->landline ?? '—' }}</div>
            </td>
            <td style="width: 20%">
                <div class="label">Color</div>
                <div class="value">{{ $vehicle->color ?? '—' }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Customer No.</div>
                <div class="value">{{ $customer->customer_id ?? '—' }}</div>
            </td>
            <td>
                <div class="label">Year / Make / Model</div>
                <div class="value">{{ $vehicle->year_model ?? '' }} {{ $vehicle->make ?? '' }} {{ $vehicle->model ?? '' }}</div>
            </td>
            <td>
                <div class="label">Mobile No.</div>
                <div class="value">{{ $customer->mobile_number ?? '—' }}</div>
            </td>
            <td>
                <div class="label">Selling Dealer</div>
                <div class="value">{{ $vehicle->selling_dealer ?? '—' }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Date/Time Received</div>
                <div class="value">{{ $so->created_at ? \Carbon\Carbon::parse($so->created_at)->format('M d, Y h:i A') : '—' }}</div>
            </td>
            <td>
                <div class="label">Business Phone No.</div>
                <div class="value">{{ $customer->business ?? '—' }}</div>
            </td>
            <td>
                <div class="label">Odometer (Km)</div>
                <div class="value">{{ $so->mileage ? number_format($so->mileage) : '—' }}</div>
            </td>
            <td>
                <div class="label">Stock No.</div>
                <div class="value">—</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Date Released</div>
                <div class="value">{{ $so->completed_at ? \Carbon\Carbon::parse($so->completed_at)->format('M d, Y') : '—' }}</div>
            </td>
            <td>
                <div class="label">Engine No.</div>
                <div class="value">{{ $vehicle->engine_number ?? '—' }}</div>
            </td>
            <td>
                <div class="label">VIN / Serial No.</div>
                <div class="value">{{ $vehicle->VIN ?? '—' }}</div>
            </td>
            <td>
                <div class="label">Registration No.</div>
                <div class="value">{{ $vehicle->registration_number ?? '—' }}</div>
            </td>
        </tr>
    </table>

    {{-- Labour / Services --}}
    @php
        $serviceItems = $billing->items->where('type', 'service');
        $partItems = $billing->items->where('type', 'part');
        $supplyItems = $billing->items->where('type', 'supply');
    @endphp

    <div class="items-section">
        <div class="section-title">Labour / Services</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 30%">Operation</th>
                    <th style="width: 40%">Description</th>
                    <th class="cnt" style="width: 10%">Units</th>
                    <th class="num" style="width: 20%">Amount</th>
                </tr>
            </thead>
            <tbody>
                @forelse($serviceItems as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td>{{ $item->name }}</td>
                        <td class="cnt">{{ $item->quantity }}</td>
                        <td class="num">₱{{ number_format($item->SubTotal, 2) }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No service items</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Parts --}}
    <div class="items-section">
        <div class="section-title">Parts</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 20%">Part Number</th>
                    <th style="width: 40%">Description</th>
                    <th class="cnt" style="width: 10%">Qty</th>
                    <th class="num" style="width: 15%">Unit Price</th>
                    <th class="num" style="width: 15%">Amount</th>
                </tr>
            </thead>
            <tbody>
                @forelse($partItems as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td>{{ $item->name }}</td>
                        <td class="cnt">{{ $item->quantity }}</td>
                        <td class="num">₱{{ number_format($item->UnitPrice, 2) }}</td>
                        <td class="num">₱{{ number_format($item->SubTotal, 2) }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="5">No parts</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Supplies, Petrol, Oils, and Lubricants --}}
    <div class="items-section">
        <div class="section-title">Supplies, Petrol, Oils, and Lubricants</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 55%">Sundries</th>
                    <th class="num" style="width: 20%">Qty</th>
                    <th class="num" style="width: 25%">Amount</th>
                </tr>
            </thead>
            <tbody>
                @forelse($supplyItems as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td class="num">{{ $item->quantity }}</td>
                        <td class="num">₱{{ number_format($item->SubTotal, 2) }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="3">No supplies</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Comments --}}
    @if($billing->notes)
        <div class="comments">
            <div class="label">Comments</div>
            <div class="value">{{ $billing->notes }}</div>
        </div>
    @endif

    {{-- Totals --}}
    @php
        $subtotal = (float) $billing->Total;
        $discountAmount = (float) $billing->discount_amount;
        $effectiveTotal = (float) $billing->effective_total;
        $totalPaid = (float) $billing->payments->sum('Amount');
        $balance = $effectiveTotal - $totalPaid;
        $downpayment = $totalPaid > 0 ? $totalPaid : 0;
    @endphp
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Total Sales:</td>
                <td class="value">₱{{ number_format($subtotal, 2) }}</td>
            </tr>
            @if($discountAmount > 0)
                <tr>
                    <td class="label">Discount:</td>
                    <td class="value" style="color: #065f46;">-₱{{ number_format($discountAmount, 2) }}</td>
                </tr>
            @endif
            @if($totalPaid > 0)
                <tr>
                    <td class="label">Amount Paid:</td>
                    <td class="value" style="color: #065f46;">₱{{ number_format($totalPaid, 2) }}</td>
                </tr>
            @endif
            <tr class="grand">
                <td class="label">Total Balance:</td>
                <td class="value">₱{{ number_format(max(0, $balance), 2) }}</td>
            </tr>
        </table>
    </div>

    {{-- Legal --}}
    <div class="legal">
        Kindly authorize and agree to pay for the above repair work done on my vehicle, including all parts and materials necessary to perform the same. In the event that the cost of the repair are not paid within (60) days from the date of the notice of completion thereof, I hereby authorize and empower the Trufit Auto Center to sell my vehicle at public auction and apply the proceeds to the cost of the repairs and the expenses, if any, shall be turned over to me.
    </div>

    {{-- Signatures --}}
    <div class="signatures">
        <div class="sig-block">
            <div class="sig-line">{{ trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '')) }}</div>
            <div class="sig-label">CUSTOMER'S SIGNATURE / DATE / TIME</div>
        </div>
        <div class="sig-block">
            <div class="sig-line">{{ $billing->createdByName ?? '' }}</div>
            <div class="sig-label">RELEASED BY / DATE / TIME</div>
        </div>
    </div>

    {{-- Footer --}}
    <div class="footer">PRICES ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE</div>

</body>
</html>
