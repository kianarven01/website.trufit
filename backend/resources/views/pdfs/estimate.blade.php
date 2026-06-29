<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Estimate</title>
    <style>
        @page {
            size: A4;
            margin: 12mm 12mm 12mm 12mm;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 0;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 8px;
        }
        .header-table td {
            vertical-align: top;
        }
        .logo-container {
            width: 40%;
        }
        .logo-container img {
            height: 60px;
            width: auto;
        }
        .contact-info {
            width: 60%;
            text-align: right;
            font-size: 10px;
        }
        .contact-info p {
            margin: 2px 0;
            color: #cc0000;
            font-style: italic;
        }
        .contact-info a {
            color: #0033a0;
            text-decoration: underline;
        }
        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .label {
            font-size: 7px;
            font-weight: bold;
            display: block;
            margin-bottom: 1px;
            color: #000;
        }
        .value {
            font-size: 9.5px;
            color: #000;
        }
        .cell {
            border: 0.5px solid #00008b;
            padding: 2px 5px;
            vertical-align: top;
        }

        /* Items Tables */
        .items-table {
            margin-bottom: 12px;
        }
        .items-table th {
            text-align: center;
            font-weight: bold;
            font-style: italic;
            padding: 4px 5px;
            border-bottom: none;
            font-size: 10px;
        }
        .items-table td {
            padding: 4px 5px;
            vertical-align: top;
            font-size: 9.5px;
        }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }

        .section-header {
            font-weight: bold;
            font-style: italic;
            margin-top: 10px;
            margin-bottom: 4px;
            font-size: 10px;
        }

        .totals-table {
            width: 35%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 4px;
            font-size: 11px;
            vertical-align: middle;
        }
        .totals-table .total-label {
            font-weight: bold;
            text-align: right;
            padding-right: 15px;
        }
        .totals-table .total-value {
            text-align: right;
            width: 100px;
        }
        .totals-table .grand-total-value {
            border: 1.5px solid #000;
            padding: 3px 6px;
            font-size: 11.5px;
            text-align: right;
            font-weight: bold;
        }

        .dash { text-align: right; color: #999; }

        .payment-box {
            display: inline-block;
            width: 9px;
            height: 9px;
            border: 0.5px solid #00008b;
            vertical-align: middle;
            margin-right: 4px;
        }
        .payment-item {
            margin-bottom: 4px;
            font-size: 8px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="logo-container">
                @php
                    $logoPath = public_path('images/logo-white1.webp');
                    $logoData = '';
                    if (file_exists($logoPath)) {
                        $logoData = 'data:image/webp;base64,' . base64_encode(file_get_contents($logoPath));
                    }
                @endphp
                @if($logoData)
                    <img src="{{ $logoData }}" alt="Trufit Auto Center">
                @else
                    <div style="font-size:24px;font-weight:bold;">
                        <span style="color:#0033a0;font-size:30px;">TRUFIT</span><br>
                        <span style="font-weight:normal;font-size:14px;color:#000;">Auto Center</span>
                    </div>
                @endif
            </td>
            <td class="contact-info">
                <p>1042 Vinzons Ave. P1 Brgy. Gahonon Daet, Camarines Norte</p>
                <p>Telephone No. 09187747788 / 09757210388</p>
                <p>Email Add: <a href="mailto:trufitautocenter@gmail.com">trufitautocenter@gmail.com</a></p>
            </td>
        </tr>
    </table>

    <div class="title">JOB ESTIMATE</div>

    <table style="border: 1px solid #00008b; border-collapse: collapse; width: 100%;">
        <tr>
            <!-- Main content area -->
            <td style="padding: 0; border: none; vertical-align: top;">

                <!-- Page header bar -->
                <div style="border-bottom: 1px solid #00008b; padding: 3px 5px; font-size: 8px; font-weight: bold;">
                    <span style="float:left;">Page 1 of 1</span>
                    <span style="float:right;">Estimate No. estimate-{{ str_pad($estimate->id, 5, '0', STR_PAD_LEFT) }}</span>
                    <div style="clear:both;"></div>
                </div>

                <!-- ═══ ROW GROUP A: Customer Info (3 rows, 5 columns) ═══ -->
                <table style="width:100%; border-collapse:collapse;">
                    <!-- Row A1: Plate No / Customer Name / Home Phone / Color / Warranty -->
                    <tr>
                        <td width="14%" class="cell">
                            <span class="label">Plate No.:</span>
                            <span class="value" style="font-weight:bold; display:block; text-align:center; font-size:11px; margin-top:3px;">{{ $estimate->vehicle->plate_number ?? '' }}</span>
                        </td>
                        <td width="28%" rowspan="3" class="cell" style="padding:0; vertical-align:top;">
                            <!-- Customer Name & Address with internal dividers -->
                            <div style="padding: 2px 5px; border-bottom: 0.5px solid #00008b;">
                                <span class="label">Customer Name & Address</span>
                            </div>
                            <div style="border-bottom: 0.5px solid #00008b; padding: 10px 10px 5px 10px; text-align:center; font-weight:bold; font-size:10px;">
                                {{ strtoupper(($estimate->customer->first_name ?? '') . ' ' . ($estimate->customer->last_name ?? '')) }}
                            </div>
                            <div style="padding: 10px; text-align:center; font-weight:bold; font-size:9.5px;">
                                {{ strtoupper($estimate->customer->address ?? '') }}
                            </div>
                        </td>
                        <td width="14%" class="cell">
                            <span class="label">Home Phone No.</span>
                            <span class="value" style="display:block; text-align:center;">{{ $estimate->customer->landline ?? '' }}</span>
                        </td>
                        <td width="22%" class="cell">
                            <span class="label">Color</span>
                            <span class="value" style="display:block; text-align:center;">{{ $estimate->vehicle->color ?? '' }}</span>
                        </td>
                        <td width="16%" class="cell">
                            <span class="label">Warranty Exp. Kms</span>
                        </td>
                    </tr>
                    <!-- Row A2: Customer No / Business Phone / Year-Make-Model / Selling Dealer -->
                    <tr>
                        <td class="cell">
                            <span class="label">Customer No.:</span>
                            <span class="value" style="display:block; text-align:center;">{{ $estimate->customer_id ?? '' }}</span>
                        </td>
                        <!-- Customer Name cell continues (rowspan) -->
                        <td class="cell">
                            <span class="label">Business Phone No:</span>
                            <span class="value" style="display:block; text-align:center;">{{ $estimate->customer->business ?? '' }}</span>
                        </td>
                        <td rowspan="2" class="cell" style="vertical-align:top;">
                            <span class="label">Year / Make / Model</span>
                            <span class="value" style="font-weight:bold; display:block; text-align:center; margin-top:0;">
                                {{ strtoupper(($estimate->vehicle->year_model ?? '') . ' ' . ($estimate->vehicle->make ?? '') . ' ' . ($estimate->vehicle->model ?? '') . ' ' . ($estimate->vehicle->variant ?? '')) }}
                            </span>
                        </td>
                        <td class="cell">
                            <span class="label">Selling Dealer</span>
                            <span class="value" style="display:block; text-align:center; font-size:8.5px;">{{ $estimate->vehicle->selling_dealer ?? '' }}</span>
                        </td>
                    </tr>
                    <!-- Row A3: Date/Time / Mobile / Warr Exp -->
                    <tr>
                        <td class="cell">
                            <span class="label">Date/Time Received</span>
                            <span class="value" style="display:block; text-align:center; font-size:8.5px;">{{ $estimate->created_at ? $estimate->created_at->format('F j, Y H:i') : '' }}</span>
                        </td>
                        <!-- Customer Name cell continues (rowspan) -->
                        <td class="cell">
                            <span class="label">Mobile No.</span>
                            <span class="value" style="font-weight:bold; display:block; text-align:center; font-size:9.5px;">
                                @php
                                    $mobile = $estimate->customer->mobile_number ?? '';
                                    $landline = $estimate->customer->landline ?? '';
                                    $business = $estimate->customer->business ?? '';
                                    $numbers = [];
                                    if ($mobile && $mobile !== '—') {
                                        foreach (preg_split('/[\/\\\,]+/', $mobile) as $num) {
                                            $num = trim($num);
                                            if ($num) $numbers[] = $num;
                                        }
                                    }
                                    if (count($numbers) < 2 && $landline && $landline !== '—' && !in_array(trim($landline), $numbers)) {
                                        $numbers[] = trim($landline);
                                    }
                                    if (count($numbers) < 2 && $business && $business !== '—' && !in_array(trim($business), $numbers)) {
                                        $numbers[] = trim($business);
                                    }
                                @endphp
                                @foreach($numbers as $index => $number)
                                    @if($index > 0)<br>@endif
                                    {{ $number }}
                                @endforeach
                            </span>
                        </td>
                        <!-- Year/Make/Model continues (rowspan) -->
                        <td class="cell">
                            <span class="label">Warr. Exp. Date</span>
                        </td>
                    </tr>
                </table>

                <!-- ═══ ROW GROUP B: Date Released (1 row, 6 columns — different widths!) ═══ -->
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td width="14%" class="cell">
                            <span class="label">Date Released:</span>
                        </td>
                        <td width="16%" class="cell">
                            <span class="label">Department/Team</span>
                            <span class="value" style="display:block; text-align:center;">{{ $employee->role->name ?? '' }}</span>
                        </td>
                        <td width="12%" class="cell">
                            <span class="label">Maint. Code</span>
                        </td>
                        <td width="14%" class="cell">
                            <span class="label">TIN</span>
                        </td>
                        <td width="22%" class="cell">
                            <span class="label">VIN / Serial No.</span>
                            <span class="value" style="display:block; text-align:center; font-size:8.5px;">{{ $estimate->vehicle->VIN ?? '' }}</span>
                        </td>
                        <td width="16%" class="cell">
                            <span class="label">Stock No.</span>
                        </td>
                    </tr>
                </table>

                <!-- ═══ ROW GROUP C: Service Advisor (1 row, 5 columns — different widths again!) ═══ -->
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td width="14%" class="cell">
                            <span class="label">Service Advisor No.</span>
                            <span class="value" style="display:block; text-align:center;">{{ $employee->id ?? '' }}</span>
                        </td>
                        <td width="28%" class="cell">
                            <span class="label">Service Advisor Name</span>
                            <span class="value" style="display:block; text-align:center;">{{ $employee->first_name ?? '' }} {{ $employee->last_name ?? '' }}</span>
                        </td>
                        <td width="14%" class="cell">
                            <span class="label">Date Finished:</span>
                        </td>
                        <td width="22%" class="cell">
                            <span class="label">Kilometers</span>
                            <span class="value" style="display:block; text-align:center;">{{ number_format($estimate->mileage ?? 0) }}</span>
                        </td>
                        <td width="16%" class="cell">
                            <span class="label">Engine No.</span>
                            <span class="value" style="display:block; text-align:center;">{{ $estimate->vehicle->engine_number ?? '' }}</span>
                        </td>
                    </tr>
                </table>

            </td>

            <!-- Payment Method sidebar -->
            <td width="10%" style="border-left: 0.5px solid #00008b; padding: 5px; vertical-align: top; font-size: 7.5px;">
                <span class="label" style="margin-bottom: 5px;">Payment Method</span>
                <div class="payment-item"><span class="payment-box"></span> Cash</div>
                <div class="payment-item"><span class="payment-box"></span> Credit Card</div>
                <div class="payment-item"><span class="payment-box"></span> Cheque</div>
                <div class="payment-item"><span class="payment-box"></span> Charge Acct.</div>
            </td>
        </tr>
    </table>

    <!-- Labour / Services Section -->
    @php
        $serviceItems = $estimate->items->where('item_type', 'service');
        $partItems = $estimate->items->where('item_type', 'part')->filter(function($item) {
            if ($item->product && $item->product->category) {
                $catName = is_object($item->product->category) ? $item->product->category->name : '';
                return !in_array($catName, ['Supplies', 'Oil', 'Lubricant']);
            }
            return true;
        });
        $supplyItems = $estimate->items->where('item_type', 'part')->filter(function($item) {
            if ($item->product && $item->product->category) {
                $catName = is_object($item->product->category) ? $item->product->category->name : '';
                return in_array($catName, ['Supplies', 'Oil', 'Lubricant']);
            }
            return false;
        });
        $supplyTypeItems = $estimate->items->where('item_type', 'supply');
        $supplyItems = $supplyItems->merge($supplyTypeItems);
    @endphp

    <table class="items-table" style="border:none;">
        <thead>
            <tr style="border-bottom: none;">
                <th width="20%" style="text-align: left;">Labour</th>
                <th width="40%" style="text-align: left;">Description</th>
                <th width="20%" class="text-right">Units</th>
                <th width="20%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($serviceItems as $item)
            <tr>
                <td style="text-align: left; vertical-align: top;">{{ $item->service->name ?? 'Unknown Service' }}</td>
                <td style="text-align: left; vertical-align: top;">
                    @if($item->service && $item->service->tasks)
                        @foreach(is_string($item->service->tasks) ? json_decode($item->service->tasks, true) : $item->service->tasks as $task)
                            <div style="margin-bottom: 2px;">{{ $task }}</div>
                        @endforeach
                    @endif
                </td>
                <td class="text-right" style="vertical-align: top;">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right" style="vertical-align: top;">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            @for($i = 0; $i < max(5 - $serviceItems->count(), 1); $i++)
            <tr><td><br></td><td></td><td></td><td></td></tr>
            @endfor
        </tbody>
    </table>

    <!-- Parts Section -->
    <table class="items-table" style="border:none;">
        <thead>
            <tr style="border-bottom: none;">
                <th width="20%" style="text-align: left;">Parts Number</th>
                <th width="40%" style="text-align: left;">Description</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="15%" class="text-right">Unit Price</th>
                <th width="15%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($partItems as $item)
            <tr>
                <td style="text-align: left;">{{ $item->product->SKU ?? '' }}</td>
                <td style="text-align: left;">{{ $item->product->name ?? 'Unknown Part' }}</td>
                <td class="text-center">{{ intval($item->quantity) }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            @for($i = 0; $i < max(5 - $partItems->count(), 1); $i++)
            <tr><td><br></td><td></td><td></td><td></td><td></td></tr>
            @endfor
        </tbody>
    </table>

    <!-- Supplies Section -->
    <div class="section-header">Supplies, Petrol, Oils, and Lubricants</div>
    <table class="items-table" style="border:none;">
        <tbody>
            @foreach($supplyItems as $item)
            <tr>
                <td width="20%"></td>
                <td width="40%" style="text-align: left;">{{ $item->product->name ?? 'Unknown Supply' }}</td>
                <td width="10%" class="text-center">
                    {{ intval($item->quantity) == 1 && strtolower($item->product->name ?? '') === 'sundries' ? '' : intval($item->quantity) }}
                </td>
                <td width="15%" class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td width="15%" class="text-right">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            @for($i = 0; $i < max(5 - $supplyItems->count(), 1); $i++)
            <tr><td width="20%"><br></td><td width="40%"></td><td width="10%"></td><td width="15%"></td><td width="15%"></td></tr>
            @endfor
        </tbody>
    </table>

    <!-- Comments Section -->
    <div class="section-header">Comments</div>
    <div style="border-bottom: none; min-height: 35px; padding: 4px 0; font-size: 9.5px;">
        {{ $estimate->notes ?? '' }}
    </div>

    <!-- Totals Line -->
    <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; font-size: 10.5px; border-bottom: 2.5px solid #000000ff; padding-bottom: 3px; position: relative; text-align: center;">
        <span>&lt;&lt;&lt;&lt; Total For Job 1 &gt;&gt;&gt;&gt;</span>
        <span style="position: absolute; right: 0; top: 0;">{{ number_format($estimate->total_amount, 2) }}</span>
    </div>

    <div style="text-align: right; color: red; font-weight: bold; font-size: 11px; margin-top: 2px; margin-bottom: 10px; margin-right: 5px;">
        PRICES ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE
    </div>

    <table class="totals-table">
        <tr>
            <td class="total-label">Total Sales</td>
            <td class="total-value">{{ number_format($estimate->total_amount, 2) }}</td>
        </tr>
        <tr>
            <td class="total-label">Downpayment</td>
            <td class="total-value">-</td>
        </tr>
        <tr style="font-weight:bold;">
            <td class="total-label" style="vertical-align: middle;">Total Balance</td>
            <td class="grand-total-value">{{ number_format($estimate->total_amount, 2) }}</td>
        </tr>
    </table>

</body>
</html>
