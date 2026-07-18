<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Order {{ $salesOrder->so_number }}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            margin: 0; padding: 0;
            color: #1a1a2e;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 3px solid #c41e3a; }
        .company-info { flex: 1; }
        .company-name { font-size: 20px; font-weight: bold; color: #c41e3a; margin: 0 0 4px 0; }
        .company-details { font-size: 9px; color: #555; line-height: 1.5; }
        .so-title-section { text-align: right; }
        .so-title { font-size: 22px; font-weight: bold; color: #c41e3a; margin: 0; text-transform: uppercase; }
        .so-meta { font-size: 10px; color: #333; margin-top: 6px; line-height: 1.6; }
        .so-meta strong { color: #c41e3a; }
        .parties { display: flex; gap: 20px; margin-bottom: 15px; }
        .party-box { flex: 1; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
        .party-header { background: #c41e3a; color: #fff; padding: 5px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .party-body { padding: 8px 10px; font-size: 9.5px; line-height: 1.5; }
        .party-body .label { font-size: 8px; color: #888; text-transform: uppercase; margin-bottom: 1px; }
        .party-body .value { font-weight: bold; color: #1a1a2e; margin-bottom: 6px; }
        .meta-bar { display: flex; gap: 0; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
        .meta-cell { flex: 1; padding: 6px 10px; border-right: 1px solid #ccc; }
        .meta-cell:last-child { border-right: none; }
        .meta-cell .label { font-size: 8px; color: #888; text-transform: uppercase; margin-bottom: 1px; }
        .meta-cell .value { font-size: 10px; font-weight: bold; color: #1a1a2e; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
        .items-table th { background: #c41e3a; color: #fff; padding: 6px 8px; font-size: 9px; text-transform: uppercase; text-align: left; font-weight: 600; }
        .items-table th.chk { text-align: center !important; }
        .items-table th.num { text-align: right !important; }
        .items-table th.cnt { text-align: center !important; }
        .items-table td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 9.5px; }
        .items-table td.chk { text-align: center !important; font-size: 12px; color: #888; }
        .items-table td.num { text-align: right !important; font-variant-numeric: tabular-nums; }
        .items-table td.cnt { text-align: center !important; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 15px; }
        .totals-table { width: 280px; border-collapse: collapse; }
        .totals-table td { padding: 4px 8px; font-size: 10px; }
        .totals-table .label { text-align: right; color: #555; padding-right: 12px; }
        .totals-table .value { text-align: right; font-weight: bold; font-variant-numeric: tabular-nums; }
        .totals-table .grand td { border-top: 2px solid #c41e3a; padding-top: 6px; font-size: 12px; color: #c41e3a; }
        .remarks { margin-bottom: 15px; }
        .remarks .label { font-size: 9px; font-weight: bold; color: #c41e3a; text-transform: uppercase; margin-bottom: 3px; }
        .remarks .value { font-size: 9.5px; color: #333; min-height: 20px; }
        .activity { margin-bottom: 15px; }
        .activity .title { font-size: 9px; font-weight: bold; color: #c41e3a; text-transform: uppercase; margin-bottom: 6px; }
        .activity-item { display: flex; gap: 8px; margin-bottom: 4px; font-size: 9px; }
        .activity-item .dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .activity-item .dot-green { background: #065f46; }
        .activity-item .dot-red { background: #991b1b; }
        .activity-item .dot-gray { background: #6b7280; }
        .activity-item .dot-blue { background: #1e40af; }
        .signatures { display: flex; justify-content: flex-end; gap: 40px; margin-top: 15px; padding-top: 15px; }
        .sig-block { width: 180px; text-align: center; }
        .sig-name { border-bottom: 1px solid #333; padding-bottom: 4px; font-size: 10px; font-weight: bold; color: #1a1a2e; margin-bottom: 2px; }
        .sig-label { font-size: 9px; color: #555; }
        .footer { text-align: center; font-size: 8px; color: #999; margin-top: 20px; padding-top: 8px; border-top: 1px solid #eee; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-submitted { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
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
                <img src="{{ $logoData }}" alt="Trufit" style="height: 45px; margin-bottom: 6px;">
            @else
                <div class="company-name">TRUFIT</div>
            @endif
            <div class="company-name" style="font-size: 13px;">TRUFIT Trading and Services Corp.</div>
            <div class="company-details">
                1042 Vinzons Ave. P1 Brgy. Gahonon<br>
                Daet, Camarines Norte, Philippines<br>
                Tel: 09187747788 / 09757210388<br>
                Email: trufitautocenter@gmail.com<br>
                Web: trufitautocenter.com
            </div>
        </div>
        <div class="so-title-section">
            <div class="so-title">Sales Order</div>
            <div class="so-meta">
                <strong>SO #:</strong> {{ $salesOrder->so_number }}<br>
                <strong>Date:</strong> {{ $salesOrder->created_at ? $salesOrder->created_at->format('M d, Y') : '' }}<br>
                @php
                    $statusClass = strtolower($salesOrder->Status ?? 'draft');
                @endphp
                @if($statusClass === 'approved')
                    <span class="status-badge status-{{ $statusClass }}">{{ $salesOrder->Status }}</span>
                @endif
            </div>
        </div>
    </div>

    {{-- Customer / Vehicle --}}
    <div class="parties">
        <div class="party-box">
            <div class="party-header">Customer</div>
            <div class="party-body">
                <div class="label">Full Name</div>
                <div class="value">{{ trim(($salesOrder->customer->first_name ?? '') . ' ' . ($salesOrder->customer->last_name ?? '')) }}</div>
                <div class="label">Address</div>
                <div class="value">{{ $salesOrder->customer->address ?? '' }}</div>
                <div class="label">Email</div>
                <div class="value">{{ $salesOrder->customer->email ?? '' }}</div>
                <div class="label">Phone</div>
                <div class="value">{{ $salesOrder->customer->mobile_number ?? '' }}</div>
                @if(!empty($salesOrder->customer->landline))
                    <div class="label">Landline</div>
                    <div class="value">{{ $salesOrder->customer->landline }}</div>
                @endif
                @if(!empty($salesOrder->customer->business))
                    <div class="label">Business No.</div>
                    <div class="value">{{ $salesOrder->customer->business }}</div>
                @endif
            </div>
        </div>
        <div class="party-box">
            <div class="party-header">Vehicle</div>
            <div class="party-body">
                @if($salesOrder->vehicle)
                    <div class="label">Year / Make / Model</div>
                    <div class="value">{{ $salesOrder->vehicle->year_model ?? '' }} {{ $salesOrder->vehicle->make ?? '' }} {{ $salesOrder->vehicle->model ?? '' }}</div>
                    <div class="label">Variant</div>
                    <div class="value">{{ $salesOrder->vehicle->variant ?? '' }}</div>
                    <div class="label">Color</div>
                    <div class="value">{{ $salesOrder->vehicle->color ?? '' }}</div>
                    <div class="label">Plate No.</div>
                    <div class="value">{{ $salesOrder->vehicle->plate_number ?? '' }}</div>
                    <div class="label">Engine No.</div>
                    <div class="value">{{ $salesOrder->vehicle->engine_number ?? '' }}</div>
                    <div class="label">Chassis No. (VIN)</div>
                    <div class="value">{{ $salesOrder->vehicle->VIN ?? '' }}</div>
                    <div class="label">Registration No.</div>
                    <div class="value">{{ $salesOrder->vehicle->registration_number ?? '' }}</div>
                    <div class="label">Mileage</div>
                    <div class="value">{{ ($salesOrder->mileage ?? $salesOrder->vehicle->mileage ?? 0) ? number_format($salesOrder->mileage ?? $salesOrder->vehicle->mileage ?? 0) . ' km' : 'Not Defined' }}</div>
                @else
                    <div style="text-align:center; color:#999; padding:20px 0;">No vehicle linked</div>
                @endif
            </div>
        </div>
    </div>

    {{-- Meta Bar --}}
    <div class="meta-bar">
        <div class="meta-cell">
            <div class="label">Prepared By</div>
            <div class="value">{{ $salesOrder->createdByName ?? '' }}</div>
        </div>
        <div class="meta-cell">
            <div class="label">Submitted By</div>
            <div class="value">{{ $salesOrder->submittedByName ?? '' }}</div>
        </div>
    </div>

    {{-- Items Table --}}
    <table class="items-table">
        <thead>
            <tr>
                <th width="4%">#</th>
                <th width="4%" class="chk" style="text-align: center;"></th>
                <th width="28%">Product Name</th>
                <th width="14%" class="cnt" style="text-align: center;">Part Number</th>
                <th width="10%" class="cnt" style="text-align: center;">Tax Code</th>
                <th width="10%" class="cnt" style="text-align: center;">Quantity</th>
                <th width="14%" class="num" style="text-align: right;">Unit Price</th>
                <th width="14%" class="num" style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($salesOrder->items as $index => $item)
            @php
                $taxCode = $item->TaxAtSale
                    ? ($item->TaxAtSale === 'NON_VAT' ? 'Non-VAT' : 'VAT')
                    : ($item->product->productSuppliers->first()->is_vat ?? false ? 'VAT' : 'Non-VAT');
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="chk">☐</td>
                <td>
                    {{ $item->product->name ?? 'Unknown Product' }}@if($item->product->manufacturer) <span style="color:#888;"> — {{ $item->product->manufacturer->name }}</span>@endif
                </td>
                <td class="cnt" style="text-align: center;">{{ $item->product->part_number ?? $item->product->SKU ?? '—' }}</td>
                <td class="cnt" style="text-align: center;">{{ $taxCode }}</td>
                <td class="cnt" style="text-align: center;">{{ $item->quantity }}</td>
                <td class="num" style="text-align: right;">₱{{ number_format($item->UnitPrice, 2) }}</td>
                <td class="num" style="text-align: right;">₱{{ number_format($item->SubTotal, 2) }}</td>
            </tr>
            @endforeach
            @if($salesOrder->items->count() === 0)
            <tr><td colspan="8" style="text-align:center; color:#999; padding:20px;">No items</td></tr>
            @endif
            @for($i = 0; $i < max(5 - $salesOrder->items->count(), 0); $i++)
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            @endfor
        </tbody>
    </table>

    {{-- Totals --}}
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Subtotal</td>
                <td class="value">₱{{ number_format($salesOrder->Total, 2) }}</td>
            </tr>
            @if(($salesOrder->Balance ?? 0) > 0 && $salesOrder->Balance != $salesOrder->Total)
            <tr>
                <td class="label">Balance Due</td>
                <td class="value" style="color:#c41e3a;">₱{{ number_format($salesOrder->Balance, 2) }}</td>
            </tr>
            @endif
            <tr class="grand">
                <td class="label">TOTAL</td>
                <td class="value">₱{{ number_format($salesOrder->Total, 2) }}</td>
            </tr>
        </table>
    </div>

    {{-- Remarks --}}
    <div class="remarks">
        <div class="label">Remarks</div>
        <div class="value">{{ $salesOrder->remarks ?? '' }}</div>
    </div>

    {{-- Signatures --}}
    <div class="signatures">
        <div class="sig-block">
            <div class="sig-name">{{ $salesOrder->approvedByName ?? '' }}</div>
            <div class="sig-label">Approved By</div>
        </div>
    </div>

    <div class="footer">
        This is a computer-generated document. No signature is required unless otherwise specified.
    </div>

</body>
</html>
