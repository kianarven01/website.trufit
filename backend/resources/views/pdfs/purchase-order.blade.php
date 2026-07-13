<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Purchase Order {{ $purchaseOrder->po_number }}</title>
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
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 3px solid #0033a0; }
        .company-info { flex: 1; }
        .company-name { font-size: 20px; font-weight: bold; color: #0033a0; margin: 0 0 4px 0; }
        .company-details { font-size: 9px; color: #555; line-height: 1.5; }
        .po-title-section { text-align: right; }
        .po-title { font-size: 22px; font-weight: bold; color: #0033a0; margin: 0; text-transform: uppercase; }
        .po-meta { font-size: 10px; color: #333; margin-top: 6px; line-height: 1.6; }
        .po-meta strong { color: #0033a0; }
        .parties { display: flex; gap: 20px; margin-bottom: 15px; }
        .party-box { flex: 1; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
        .party-header { background: #0033a0; color: #fff; padding: 5px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .party-body { padding: 8px 10px; font-size: 9.5px; line-height: 1.5; }
        .party-body .label { font-size: 8px; color: #888; text-transform: uppercase; margin-bottom: 1px; }
        .party-body .value { font-weight: bold; color: #1a1a2e; margin-bottom: 6px; }
        .meta-bar { display: flex; gap: 0; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
        .meta-cell { flex: 1; padding: 6px 10px; border-right: 1px solid #ccc; }
        .meta-cell:last-child { border-right: none; }
        .meta-cell .label { font-size: 8px; color: #888; text-transform: uppercase; margin-bottom: 1px; }
        .meta-cell .value { font-size: 10px; font-weight: bold; color: #1a1a2e; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
        .items-table th { background: #0033a0; color: #fff; padding: 6px 8px; font-size: 9px; text-transform: uppercase; text-align: left; font-weight: 600; }
        .items-table th.num { text-align: right !important; }
        .items-table th.cnt { text-align: center !important; }
        .items-table td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 9.5px; }
        .items-table td.num { text-align: right !important; font-variant-numeric: tabular-nums; }
        .items-table td.cnt { text-align: center !important; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .items-table tr.subtotal-row td { border-top: 2px solid #0033a0; font-weight: bold; background: #f0f4ff; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 15px; }
        .totals-table { width: 280px; border-collapse: collapse; }
        .totals-table td { padding: 4px 8px; font-size: 10px; }
        .totals-table .label { text-align: right; color: #555; padding-right: 12px; }
        .totals-table .value { text-align: right; font-weight: bold; font-variant-numeric: tabular-nums; }
        .totals-table .grand td { border-top: 2px solid #0033a0; padding-top: 6px; font-size: 12px; color: #0033a0; }
        .remarks { margin-bottom: 15px; }
        .remarks .label { font-size: 9px; font-weight: bold; color: #0033a0; text-transform: uppercase; margin-bottom: 3px; }
        .remarks .value { font-size: 9.5px; color: #333; min-height: 20px; }
        .signatures { display: flex; justify-content: flex-end; margin-top: 15px; padding-top: 15px; }
        .sig-block { width: 180px; text-align: center; }
        .sig-name { border-bottom: 1px solid #333; padding-bottom: 4px; font-size: 10px; font-weight: bold; color: #1a1a2e; margin-bottom: 2px; }
        .sig-label { font-size: 9px; color: #555; }
        .footer { text-align: center; font-size: 8px; color: #999; margin-top: 20px; padding-top: 8px; border-top: 1px solid #eee; }
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
        <div class="po-title-section">
            <div class="po-title">Purchase Order</div>
            <div class="po-meta">
                <strong>PO #:</strong> {{ $purchaseOrder->po_number }}<br>
                <strong>Date:</strong> {{ $purchaseOrder->order_date ? $purchaseOrder->order_date->format('M d, Y') : '' }}
            </div>
        </div>
    </div>

    {{-- Vendor / Ship To --}}
    <div class="parties">
        <div class="party-box">
            <div class="party-header">Vendor</div>
            <div class="party-body">
                <div class="label">Company Name</div>
                <div class="value">{{ $purchaseOrder->supplier->name ?? '' }}</div>
                <div class="label">Address</div>
                <div class="value">{{ $purchaseOrder->supplier->address ?? '' }}</div>
                <div class="label">Attn: Contact Person</div>
                <div class="value">{{ $purchaseOrder->supplier->contactPerson ?? '' }}</div>
                <div class="label">Email</div>
                <div class="value">{{ $purchaseOrder->supplier->email ?? '' }}</div>
                <div class="label">Phone</div>
                <div class="value">{{ $purchaseOrder->supplier->phone ?? '' }}</div>
            </div>
        </div>
        <div class="party-box">
            <div class="party-header">Ship To</div>
            <div class="party-body">
                <div class="label">Company Name</div>
                <div class="value">TRUFIT Auto Center</div>
                <div class="label">Address</div>
                <div class="value">1042 Vinzons Ave. P1 Brgy. Gahonon<br>Daet, Camarines Norte, Philippines</div>
                <div class="label">Phone</div>
                <div class="value">09187747788</div>
                <div class="label">Email</div>
                <div class="value">trufitautocenter@gmail.com</div>
            </div>
        </div>
    </div>

    {{-- Meta Bar --}}
    <div class="meta-bar">
        <div class="meta-cell">
            <div class="label">Payment Terms</div>
            <div class="value">{{ str_replace('_', ' ', $purchaseOrder->supplier->paymentTerms ?? 'COD') }}</div>
        </div>
        <div class="meta-cell">
            <div class="label">Expected Delivery Date</div>
            <div class="value">{{ $purchaseOrder->request_ship_date ? $purchaseOrder->request_ship_date->format('M d, Y') : '' }}</div>
        </div>
        <div class="meta-cell">
            <div class="label">Prepared By</div>
            <div class="value">{{ $purchaseOrder->createdByName ?? '' }}</div>
        </div>
    </div>

    {{-- Items Table --}}
    <table class="items-table">
        <thead>
            <tr>
                <th width="4%">#</th>
                <th width="36%">Product Name</th>
                <th width="18%" class="cnt" style="text-align: center;">Tax Code</th>
                <th width="18%" class="cnt" style="text-align: center;">Quantity</th>
                <th width="12%" class="num" style="text-align: right;">Unit Price</th>
                <th width="12%" class="num" style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($purchaseOrder->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    {{ $item->product->name ?? 'Unknown Product' }}@if($item->product->manufacturer) <span style="color:#888;"> — {{ $item->product->manufacturer->name }}</span>@endif
                    @if($item->product->part_number)
                        <br><span style="font-size:8px; color:#888;">P/N: {{ $item->product->part_number }}</span>
                    @endif
                    @if($item->notes)
                        <br><span style="font-size:8px; color:#666;">{{ $item->notes }}</span>
                    @endif
                </td>
                <td class="cnt" style="text-align: center;">{{ ($item->tax_type === 'NON_TAXABLE' ? 'Non-VAT' : 'VAT') }}</td>
                <td class="cnt" style="text-align: center;">{{ $item->quantity_ordered }}</td>
                <td class="num" style="text-align: right;">{{ number_format($item->unit_cost, 2) }}</td>
                <td class="num" style="text-align: right;">{{ number_format($item->line_total, 2) }}</td>
            </tr>
            @endforeach
            @if($purchaseOrder->items->count() === 0)
            <tr><td colspan="6" style="text-align:center; color:#999; padding:20px;">No items</td></tr>
            @endif
            {{-- Empty rows to fill space --}}
            @for($i = 0; $i < max(5 - $purchaseOrder->items->count(), 0); $i++)
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
            @endfor
        </tbody>
    </table>

    {{-- Totals --}}
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Subtotal</td>
                <td class="value">₱{{ number_format($purchaseOrder->subtotal ?? $purchaseOrder->total_amount, 2) }}</td>
            </tr>
            <tr class="grand">
                <td class="label">TOTAL</td>
                <td class="value">₱{{ number_format($purchaseOrder->total_amount, 2) }}</td>
            </tr>
        </table>
    </div>

    {{-- Remarks --}}
    <div class="remarks">
        <div class="label">Remarks</div>
        <div class="value">{{ $purchaseOrder->remarks ?? '' }}</div>
    </div>

    {{-- Signatures --}}
    <div class="signatures">
        <div class="sig-block">
            <div class="sig-name">{{ $purchaseOrder->approvedByName ?? '' }}</div>
            <div class="sig-label">Approved By</div>
        </div>
    </div>

    <div class="footer">
        This is a computer-generated document. No signature is required unless otherwise specified.
    </div>

</body>
</html>
