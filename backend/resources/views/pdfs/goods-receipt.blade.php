<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Goods Receipt {{ $receipt->receipt_number }}</title>
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
        .gr-title-section { text-align: right; }
        .gr-title { font-size: 22px; font-weight: bold; color: #0033a0; margin: 0; text-transform: uppercase; }
        .gr-meta { font-size: 10px; color: #333; margin-top: 6px; line-height: 1.6; }
        .gr-meta strong { color: #0033a0; }
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
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .items-table th { background: #0033a0; color: #fff; padding: 6px 8px; font-size: 9px; text-transform: uppercase; text-align: left; font-weight: 600; }
        .items-table th.num { text-align: right; }
        .items-table th.cnt { text-align: center; }
        .items-table td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 9.5px; }
        .items-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
        .items-table td.cnt { text-align: center; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 15px; }
        .totals-table { width: 280px; border-collapse: collapse; }
        .totals-table td { padding: 4px 8px; font-size: 10px; }
        .totals-table .label { text-align: right; color: #555; padding-right: 12px; }
        .totals-table .value { text-align: right; font-weight: bold; font-variant-numeric: tabular-nums; }
        .totals-table .grand td { border-top: 2px solid #0033a0; padding-top: 6px; font-size: 12px; color: #0033a0; }
        .remarks { margin-bottom: 15px; }
        .remarks .label { font-size: 9px; font-weight: bold; color: #0033a0; text-transform: uppercase; margin-bottom: 3px; }
        .remarks .value { font-size: 9.5px; color: #333; min-height: 20px; }
        .signatures { display: flex; gap: 40px; margin-top: 25px; padding-top: 15px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 9px; color: #555; }
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
            <div class="company-name" style="font-size: 13px;">TRUFIT Auto Center</div>
            <div class="company-details">
                1042 Vinzons Ave. P1 Brgy. Gahonon<br>
                Daet, Camarines Norte, Philippines<br>
                Tel: 09187747788 / 09757210388<br>
                Email: trufitautocenter@gmail.com
            </div>
        </div>
        <div class="gr-title-section">
            <div class="gr-title">Goods Receipt</div>
            <div class="gr-meta">
                <strong>GR #:</strong> {{ $receipt->receipt_number }}<br>
                <strong>PO #:</strong> {{ $receipt->purchaseOrder->po_number ?? '' }}<br>
                <strong>Status:</strong> {{ $receipt->status }}
            </div>
        </div>
    </div>

    {{-- Vendor / Ship To --}}
    <div class="parties">
        <div class="party-box">
            <div class="party-header">Vendor</div>
            <div class="party-body">
                <div class="label">Company Name</div>
                <div class="value">{{ $receipt->purchaseOrder->supplier->name ?? '' }}</div>
                <div class="label">Address</div>
                <div class="value">{{ $receipt->purchaseOrder->supplier->address ?? '' }}</div>
                <div class="label">Phone</div>
                <div class="value">{{ $receipt->purchaseOrder->supplier->phone ?? '' }}</div>
            </div>
        </div>
        <div class="party-box">
            <div class="party-header">Ship To</div>
            <div class="party-body">
                <div class="label">Company Name</div>
                <div class="value">TRUFIT Auto Center</div>
                <div class="label">Address</div>
                <div class="value">1042 Vinzons Ave. P1 Brgy. Gahonon<br>Daet, Camarines Norte, Philippines</div>
            </div>
        </div>
    </div>

    {{-- Meta Bar --}}
    <div class="meta-bar">
        <div class="meta-cell">
            <div class="label">Received Date</div>
            <div class="value">{{ $receipt->received_at ? $receipt->received_at->format('M d, Y') : '—' }}</div>
        </div>
        <div class="meta-cell">
            <div class="label">Approved Date</div>
            <div class="value">{{ $receipt->approved_at ? $receipt->approved_at->format('M d, Y') : '—' }}</div>
        </div>
        <div class="meta-cell">
            <div class="label">Received By</div>
            <div class="value">{{ $receipt->receivedByName ?? '—' }}</div>
        </div>
    </div>

    {{-- Items Table --}}
    <table class="items-table">
        <thead>
            <tr>
                <th width="5%">#</th>
                <th width="30%">Description</th>
                <th width="10%" class="cnt">Ordered</th>
                <th width="10%" class="cnt">Received</th>
                <th width="10%" class="cnt">Rejected</th>
                <th width="10%" class="cnt">Returned</th>
                <th width="12%" class="num">Unit Cost</th>
                <th width="13%" class="num">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($receipt->items as $index => $item)
            @php
                $unitCost = $item->purchaseOrderItem->unit_cost ?? 0;
                $lineTotal = $item->quantity_received * $unitCost;
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    {{ $item->product->name ?? 'Unknown Product' }}
                    @if($item->product->part_number)
                        <br><span style="font-size:8px; color:#888;">P/N: {{ $item->product->part_number }}</span>
                    @endif
                </td>
                <td class="cnt">{{ $item->purchaseOrderItem->quantity_ordered ?? '—' }}</td>
                <td class="cnt">{{ $item->quantity_received }}</td>
                <td class="cnt">{{ $item->quantity_rejected ?: '—' }}</td>
                <td class="cnt">{{ $item->quantity_returned ?: '—' }}</td>
                <td class="num">{{ number_format($unitCost, 2) }}</td>
                <td class="num">{{ number_format($lineTotal, 2) }}</td>
            </tr>
            @endforeach
            @if($receipt->items->count() === 0)
            <tr><td colspan="8" style="text-align:center; color:#999; padding:20px;">No items</td></tr>
            @endif
        </tbody>
    </table>

    {{-- Remarks --}}
    @if($receipt->notes)
    <div class="remarks">
        <div class="label">Notes</div>
        <div class="value">{{ $receipt->notes }}</div>
    </div>
    @endif

    {{-- Signatures --}}
    <div class="signatures">
        <div class="sig-block">
            <div class="sig-line">Received By</div>
        </div>
        <div class="sig-block">
            <div class="sig-line">Approved By</div>
        </div>
        <div class="sig-block">
            <div class="sig-line">Verified By</div>
        </div>
    </div>

    <div class="footer">
        This is a computer-generated document. No signature is required unless otherwise specified.
    </div>

</body>
</html>
