<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Estimate</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 15px;
        }
        .header-table td {
            vertical-align: top;
        }
        .logo-container {
            width: 40%;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #0033a0; /* Trufit Blue */
        }
        .contact-info {
            width: 60%;
            text-align: right;
            font-size: 10px;
        }
        .contact-info p {
            margin: 2px 0;
            color: #cc0000; /* Trufit Red */
            font-style: italic;
        }
        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        /* Information Table (Customer/Vehicle Info) */
        .info-table {
            border: 2px solid #0033a0;
            margin-bottom: 20px;
        }
        .info-table th, .info-table td {
            border: 1px solid #0033a0;
            padding: 3px 5px;
            vertical-align: top;
            height: 25px; /* Minimum height to look like the form */
        }
        .label {
            font-size: 8px;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }
        .value {
            font-size: 10px;
        }

        /* Items Tables */
        .items-table {
            margin-bottom: 20px;
            border-bottom: 1px solid #000;
        }
        .items-table th {
            text-align: center;
            font-weight: bold;
            font-style: italic;
            padding: 5px;
            border-bottom: 1px solid #000;
        }
        .items-table td {
            padding: 5px;
            vertical-align: top;
        }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        
        .section-header {
            font-weight: bold;
            font-style: italic;
            margin-top: 15px;
            margin-bottom: 5px;
        }

        .footer {
            margin-top: 30px;
        }
        .disclaimer {
            text-align: center;
            color: red;
            font-weight: bold;
            font-size: 12px;
            margin: 10px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .totals-table {
            width: 40%;
            margin-left: auto;
        }
        .totals-table td {
            padding: 3px;
            font-size: 11px;
        }
        .totals-table .total-label {
            font-weight: bold;
        }
        .totals-table .total-value {
            text-align: right;
        }
        .totals-table .grand-total-row {
            font-weight: bold;
        }
        .totals-table .grand-total-value {
            border: 1px solid #0033a0;
            padding: 5px;
        }

        .page-info {
            font-size: 8px;
            margin-bottom: 2px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="logo-container">
                <div class="logo-text">
                    <span style="color:#cc0000;font-size:30px;font-family:sans-serif;">TRUFIT</span><br>
                    <span style="font-weight:normal;font-size:14px;color:#000;">Auto Center</span>
                </div>
            </td>
            <td class="contact-info">
                <p>1042 Vinzons Ave. P1 Brgy. Gahonon Daet, Camarines Norte</p>
                <p>Telephone No. 09187747788 / 09757210388</p>
                <p>Email Add: trufitautocenter@gmail.com</p>
            </td>
        </tr>
    </table>

    <div class="title">JOB ESTIMATE</div>

    <div class="page-info">
        <span style="float:left">Page 1 of 1</span>
        <span style="float:right;font-weight:bold;">JO NO. EST-{{ str_pad($estimate->id, 5, '0', STR_PAD_LEFT) }}</span>
        <div style="clear:both;"></div>
    </div>

    <!-- Information Form -->
    <table class="info-table">
        <tr>
            <td width="15%">
                <span class="label">Plate No.:</span>
                <span class="value">{{ $estimate->vehicle->license_plate ?? '' }}</span>
            </td>
            <td width="30%" rowspan="3">
                <span class="label">Customer Name & Address</span>
                <span class="value">{{ $estimate->customer->first_name ?? '' }} {{ $estimate->customer->last_name ?? '' }}</span><br>
                <span class="value">{{ $estimate->customer->address ?? '' }}</span>
            </td>
            <td width="15%">
                <span class="label">Home Phone No.</span>
            </td>
            <td width="15%">
                <span class="label">Color</span>
                <span class="value">{{ $estimate->vehicle->color ?? '' }}</span>
            </td>
            <td width="15%">
                <span class="label">Warranty Exp. Kms</span>
            </td>
            <td width="10%" rowspan="4" style="font-size:8px;">
                <span class="label">Payment Method</span>
                <div style="margin-bottom:3px;"><input type="checkbox"> Cash</div>
                <div style="margin-bottom:3px;"><input type="checkbox"> Credit Card</div>
                <div style="margin-bottom:3px;"><input type="checkbox"> Cheque</div>
                <div style="margin-bottom:3px;"><input type="checkbox"> Charge Acct.</div>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Customer No.:</span>
                <span class="value">{{ $estimate->customer_id ?? '' }}</span>
            </td>
            <td>
                <span class="label">Business Phone No:</span>
                <span class="value">{{ $estimate->customer->phone_number ?? '' }}</span>
            </td>
            <td rowspan="2">
                <span class="label">Year / Make / Model</span>
                <span class="value">{{ $estimate->vehicle->year ?? '' }} / {{ $estimate->vehicle->make ?? '' }} / {{ $estimate->vehicle->model ?? '' }}</span>
            </td>
            <td>
                <span class="label">Selling Dealer</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Date/Time Received</span>
                <span class="value">{{ $estimate->created_at ? $estimate->created_at->format('m/d/Y H:i') : '' }}</span>
            </td>
            <td>
                <span class="label">Mobile No.</span>
                <span class="value">{{ $estimate->customer->phone_number ?? '' }}</span>
            </td>
            <td>
                <span class="label">Warr. Exp. Date</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Date Released:</span>
            </td>
            <td>
                <table style="width:100%;margin:0;padding:0;">
                    <tr>
                        <td style="border:none;border-right:1px solid #0033a0;padding:0;width:50%;"><span class="label">Department/Team</span></td>
                        <td style="border:none;padding:0;padding-left:5px;"><span class="label">Maint. Code</span></td>
                    </tr>
                </table>
            </td>
            <td>
                <span class="label">TIN</span>
            </td>
            <td>
                <span class="label">VIN / Serial No.</span>
                <span class="value">{{ $estimate->vehicle->vin ?? '' }}</span>
            </td>
            <td>
                <span class="label">Stock No.</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Service Advisor No.</span>
            </td>
            <td colspan="2">
                <span class="label">Service Advisor Name</span>
            </td>
            <td>
                <span class="label">Date Finished:</span>
            </td>
            <td>
                <span class="label">Kilometers</span>
                <span class="value">{{ $estimate->vehicle->mileage ?? '' }}</span>
            </td>
            <td>
                <span class="label">Engine No.</span>
            </td>
        </tr>
    </table>

    <!-- Labour / Services Section -->
    <table class="items-table" style="border:none;">
        <thead>
            <tr>
                <th width="20%">Labour</th>
                <th width="40%">Description</th>
                <th width="20%" class="text-center">Units</th>
                <th width="20%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estimate->items->where('item_type', 'service') as $item)
            <tr>
                <td>{{ $item->service->name ?? 'Unknown Service' }}</td>
                <td>
                    @if($item->service && $item->service->tasks)
                        {{ implode(', ', is_string($item->service->tasks) ? json_decode($item->service->tasks, true) : $item->service->tasks) }}
                    @endif
                </td>
                <td class="text-center">1</td>
                <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            <!-- Add a few blank rows to pad it out like the proforma -->
            <tr><td><br></td><td></td><td></td><td>-</td></tr>
            <tr><td><br></td><td></td><td></td><td>-</td></tr>
        </tbody>
    </table>

    <!-- Parts Section -->
    <table class="items-table" style="border:none;">
        <thead>
            <tr>
                <th width="20%">Parts Number</th>
                <th width="40%">Description</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="15%" class="text-right">Unit Price</th>
                <th width="15%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estimate->items->where('item_type', 'part')->whereNotIn('product.category', ['Supplies', 'Oil', 'Lubricant']) as $item)
            <tr>
                <td>{{ $item->product->sku ?? '' }}</td>
                <td>{{ $item->product->name ?? 'Unknown Part' }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            <tr><td><br></td><td></td><td></td><td></td><td>-</td></tr>
            <tr><td><br></td><td></td><td></td><td></td><td>-</td></tr>
        </tbody>
    </table>

    <!-- Supplies Section -->
    <div class="section-header">Supplies, Petrol, Oils, and Lubricants</div>
    <table class="items-table" style="border:none;">
        <tbody>
            @foreach($estimate->items->where('item_type', 'part')->whereIn('product.category', ['Supplies', 'Oil', 'Lubricant']) as $item)
            <tr>
                <td width="20%">{{ $item->product->sku ?? '' }}</td>
                <td width="40%">{{ $item->product->name ?? 'Unknown Supply' }}</td>
                <td width="10%" class="text-center">{{ $item->quantity }}</td>
                <td width="15%" class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td width="15%" class="text-right">{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            <tr><td width="20%"><br></td><td width="40%"></td><td width="10%"></td><td width="15%"></td><td width="15%" class="text-right">-</td></tr>
        </tbody>
    </table>

    <!-- Comments Section -->
    <div class="section-header">Comments</div>
    <div style="border-bottom: 1px solid #000; min-height: 50px;">
        {{ $estimate->notes ?? '' }}
    </div>

    <!-- Totals -->
    <div style="text-align:center;font-weight:bold;font-size:10px;margin-top:10px;">
        &lt;&lt;&lt; Total For Job 1 &gt;&gt;&gt; <span style="float:right;">-</span>
    </div>

    <div class="disclaimer">
        PRICES ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE
    </div>

    <table class="totals-table">
        <tr>
            <td class="total-label text-right">Total Sales</td>
            <td class="total-value">{{ number_format($estimate->total_amount, 2) }}</td>
        </tr>
        <tr>
            <td class="total-label text-right">Downpayment</td>
            <td class="total-value">-</td>
        </tr>
        <tr class="grand-total-row">
            <td class="total-label text-right" style="vertical-align: middle;">Total Balance</td>
            <td class="total-value grand-total-value">{{ number_format($estimate->total_amount, 2) }}</td>
        </tr>
    </table>

</body>
</html>
