<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Order - {{ $jobOrder->jo_number }}</title>
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

        .page-break {
            page-break-before: always;
        }

        /* Header */
        .header-table { margin-bottom: 8px; }
        .header-table td { vertical-align: top; }
        .logo-container { width: 40%; }
        .logo-container img { height: 60px; width: auto; }
        .contact-info { width: 60%; text-align: right; font-size: 10px; }
        .contact-info p { margin: 2px 0; color: #cc0000; font-style: italic; }
        .contact-info a { color: #0033a0; text-decoration: underline; }

        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
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
            border-bottom: 0.5px solid #ccc;
            padding-bottom: 2px;
            min-height: 12px;
            display: block;
        }

        .cell {
            border: 0.5px solid #000;
            padding: 2px 5px;
            vertical-align: top;
        }

        /* Info Grid */
        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .info-grid td {
            border: 0.5px solid #000;
            padding: 3px 5px;
            vertical-align: top;
            width: 25%;
        }

        .info-grid .wide { width: 50%; }

        /* Payment Method */
        .payment-box {
            border: 1px solid #000;
            padding: 5px 10px;
            margin-bottom: 10px;
            display: inline-block;
        }

        .payment-box label {
            margin-right: 15px;
            font-size: 9px;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .data-table th {
            background: #000;
            color: #fff;
            font-size: 8px;
            font-weight: bold;
            padding: 4px 5px;
            text-align: center;
            border: 0.5px solid #000;
        }

        .data-table td {
            border: 0.5px solid #000;
            padding: 4px 5px;
            font-size: 9px;
            vertical-align: top;
        }

        .data-table td.center { text-align: center; }

        /* Section Headers */
        .section-header {
            font-weight: bold;
            font-style: italic;
            margin-top: 10px;
            margin-bottom: 4px;
            font-size: 10px;
            text-transform: uppercase;
        }

        /* Footer / Authorization */
        .authorization {
            border: 1px solid #000;
            padding: 8px;
            margin-top: 15px;
            font-size: 8px;
            line-height: 1.4;
        }

        .signature-line {
            margin-top: 20px;
            border-top: 1px solid #000;
            width: 250px;
            display: inline-block;
            text-align: center;
            font-size: 8px;
            padding-top: 3px;
        }

        /* Tech Request Form */
        .tech-table {
            width: 100%;
            border-collapse: collapse;
        }

        .tech-table th {
            background: #0033a0;
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            padding: 5px;
            text-align: center;
            border: 1px solid #000;
        }

        .tech-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            font-size: 9px;
            vertical-align: top;
            height: 18px;
        }

        .tech-table td.center { text-align: center; }

        .road-test-table {
            width: 100%;
            border-collapse: collapse;
        }

        .road-test-table th {
            font-size: 8px;
            font-weight: bold;
            padding: 3px 5px;
            text-align: center;
            border: 1px solid #000;
        }

        .road-test-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 8px;
            text-align: center;
            height: 16px;
        }

        .fuel-line {
            display: inline-block;
            width: 80px;
            border-bottom: 1px solid #000;
            margin-left: 5px;
        }
    </style>
</head>
<body>

{{-- ============================================================ --}}
{{-- PAGE 1: JOB ORDER FORM --}}
{{-- ============================================================ --}}
<div>
    {{-- Header --}}
    @php
        $logoPath = public_path('images/logo-white1.webp');
        $logoData = '';
        if (file_exists($logoPath)) {
            $logoData = 'data:image/webp;base64,' . base64_encode(file_get_contents($logoPath));
        }
    @endphp

    <table class="header-table">
        <tr>
            <td class="logo-container">
                @if($logoData)
                    <img src="{{ $logoData }}" alt="TruFit Logo">
                @endif
            </td>
            <td class="contact-info">
                <p style="color:#000; font-style:normal; font-size:9px;">3042 V. Vercons Ave., Brgy. Guadalupe Duel, Carmen, Norte</p>
                <p>Telephone No.: (034) 747-1944 / (034) 212-1065</p>
                <p>Email Add: <a href="mailto:trufitautocenter@gmail.com">trufitautocenter@gmail.com</a></p>
            </td>
        </tr>
    </table>

    {{-- Title --}}
    <div class="title">JOB ORDER</div>

    {{-- Info Grid --}}
    <table class="info-grid">
        <tr>
            <td>
                <span class="label">Plate No.</span>
                <span class="value">{{ $jobOrder->vehicle?->plate_number ?? '—' }}</span>
            </td>
            <td class="wide">
                <span class="label">Customer Name & Address</span>
                <span class="value">
                    {{ $jobOrder->salesOrder?->customer?->first_name ?? '' }} {{ $jobOrder->salesOrder?->customer?->last_name ?? '' }}
                    @if($jobOrder->salesOrder?->customer?->address)
                        <br>{{ $jobOrder->salesOrder->customer->address }}
                    @endif
                </span>
            </td>
            <td>
                <span class="label">Home/Phone No.</span>
                <span class="value">{{ $jobOrder->salesOrder?->customer?->mobile_number ?? '—' }}</span>
            </td>
            <td>
                <span class="label">Color</span>
                <span class="value">{{ $jobOrder->vehicle?->color ?? '—' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Customer No.</span>
                <span class="value">{{ $jobOrder->salesOrder?->customer?->customer_id ?? '—' }}</span>
            </td>
            <td class="wide">
                <span class="label">Business Phone No.</span>
                <span class="value">{{ $jobOrder->salesOrder?->customer?->landline ?? '—' }}</span>
            </td>
            <td>
                <span class="label">Year / Make / Model</span>
                <span class="value">{{ $jobOrder->vehicle?->year_model ?? '' }} {{ $jobOrder->vehicle?->make ?? '' }} {{ $jobOrder->vehicle?->model ?? '' }}</span>
            </td>
            <td>
                <span class="label">Selling Dealer</span>
                <span class="value">{{ $jobOrder->vehicle?->selling_dealer ?? '—' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Date/Time Received</span>
                <span class="value">{{ $jobOrder->date ? date('F j, Y', strtotime($jobOrder->date)) : '—' }}</span>
            </td>
            <td class="wide">
                <span class="label">Address</span>
                <span class="value">{{ $jobOrder->salesOrder?->customer?->address ?? '—' }}</span>
            </td>
            <td colspan="2">
                <span class="label">Warranty Expiry Date</span>
                <span class="value">—</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Vehicle Odom.</span>
                <span class="value">{{ number_format($jobOrder->vehicle?->mileage ?? $jobOrder->salesOrder?->mileage ?? 0) }} km</span>
            </td>
            <td class="wide">
                <span class="label">VIN</span>
                <span class="value">{{ $jobOrder->vehicle?->VIN ?? '—' }}</span>
            </td>
            <td>
                <span class="label">VIN/Serial No</span>
                <span class="value">{{ $jobOrder->vehicle?->VIN ?? '—' }}</span>
            </td>
            <td>
                <span class="label">Glass No.</span>
                <span class="value">—</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Kilometers</span>
                <span class="value">{{ number_format($jobOrder->vehicle?->mileage ?? $jobOrder->salesOrder?->mileage ?? 0) }}</span>
            </td>
            <td class="wide">
                <span class="label">Engine No.</span>
                <span class="value">{{ $jobOrder->vehicle?->engine_number ?? '—' }}</span>
            </td>
            <td colspan="2">
                <span class="label">JO NO.</span>
                <span class="value" style="font-weight: bold;">{{ $jobOrder->jo_number ?? '—' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Service Advisor Name</span>
                <span class="value">{{ $jobOrder->technicians->firstWhere('role', 'PRIMARY')?->employee?->first_name ?? '' }} {{ $jobOrder->technicians->firstWhere('role', 'PRIMARY')?->employee?->last_name ?? '' }}</span>
            </td>
            <td class="wide">
                <span class="label">Date & Finished</span>
                <span class="value">{{ $jobOrder->status === 'Completed' ? date('F j, Y', strtotime($jobOrder->updated_at)) : '—' }}</span>
            </td>
            <td colspan="2">
                <span class="label">Registration No.</span>
                <span class="value">{{ $jobOrder->vehicle?->registration_number ?? '—' }}</span>
            </td>
        </tr>
    </table>

    {{-- Payment Method --}}
    <div class="payment-box">
        <span class="label" style="display: inline; margin-right: 10px;">Payment Method:</span>
        <label>☐ Cash</label>
        <label>☐ Credit Card</label>
        <label>☐ E-wallet</label>
        <label>☐ Garage A/c</label>
    </div>

    {{-- Labour / Services Table --}}
    <div class="section-header">Labour</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25%;">Operation</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            @forelse($jobOrder->services as $service)
                <tr>
                    <td class="center">{{ $service->custom_name ?? $service->serviceType?->name ?? 'Service' }}</td>
                    <td>
                        @if($service->serviceType?->tasks && count($service->serviceType->tasks) > 0)
                            @foreach($service->serviceType->tasks as $task)
                                • {{ $task }}<br>
                            @endforeach
                        @else
                            —
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" class="center" style="color: #999;">No services recorded</td>
                </tr>
            @endforelse
            {{-- Add empty rows to fill space --}}
            @for($i = 0; $i < max(0, 5 - $jobOrder->services->count()); $i++)
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
            @endfor
        </tbody>
    </table>

    {{-- Recommendation --}}
    <div class="section-header">Recommendation</div>
    <div style="border: 1px solid #000; padding: 8px; min-height: 40px; font-size: 9px;">
        {{ $jobOrder->notes ?? 'No recommendations recorded.' }}
    </div>

    {{-- Authorization --}}
    <div class="authorization">
        I hereby authorize <strong>TruFit Auto Center</strong> to proceed with the repair work to be done along with the necessary materials/parts. TruFit Auto Center will not be held responsible for
        consequential loss or damage including, but not limited to, loss of motor vehicle use, loss of time, loss of income, loss of pleasure, travel expenses, accommodation expenses or
        unavailability of parts or delays in parts shipments by the supplier or the_inspector. My signature here is evidence of my full understanding and my acknowledgment of the
        conditions covered herein.
        <div style="margin-top: 15px;">
            <div class="signature-line">CUSTOMER'S SIGNATURE / DATE / TIME</div>
        </div>
    </div>
</div>

{{-- ============================================================ --}}
{{-- PAGE 2: TECH REQUEST FORM --}}
{{-- ============================================================ --}}
<div class="page-break">
    <div class="title">TECH REQUEST FORM</div>

    <div style="margin-bottom: 5px; font-size: 9px;">
        <strong>JO No.:</strong> {{ $jobOrder->jo_number ?? '—' }} &nbsp;&nbsp;
        <strong>Plate No.:</strong> {{ $jobOrder->vehicle?->plate_number ?? '—' }} &nbsp;&nbsp;
        <strong>Date:</strong> {{ $jobOrder->date ? date('M j, Y', strtotime($jobOrder->date)) : '—' }}
    </div>

    <table class="tech-table">
        <thead>
            <tr>
                <th style="width: 8%;">TECH</th>
                <th style="width: 52%;">JOB DONE</th>
                <th style="width: 10%;">P</th>
                <th style="width: 10%;">A</th>
            </tr>
        </thead>
        <tbody>
            @forelse($jobOrder->services as $service)
                {{-- Service row --}}
                <tr>
                    <td class="center" style="font-weight: bold; background: #f0f0f0;">
                        {{ $jobOrder->technicians->first()?->employee?->last_name ?? '' }}
                    </td>
                    <td style="font-weight: bold; text-align: center;">
                        {{ $service->custom_name ?? $service->serviceType?->name ?? 'Service' }}
                    </td>
                    <td class="center">{{ $service->serviceType?->duration ?? '—' }}</td>
                    <td class="center">
                        @php
                            $techTime = $jobOrder->technicians->first()?->accumulated_seconds ?? 0;
                            $mins = floor($techTime / 60);
                        @endphp
                        {{ $mins > 0 ? $mins . 'm' : '—' }}
                    </td>
                </tr>
                {{-- Task rows --}}
                @if($service->serviceType?->tasks && count($service->serviceType->tasks) > 0)
                    @foreach($service->serviceType->tasks as $task)
                        <tr>
                            <td></td>
                            <td style="padding-left: 15px;">• {{ $task }}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    @endforeach
                @endif
            @empty
                <tr>
                    <td colspan="4" class="center" style="color: #999;">No services recorded</td>
                </tr>
            @endforelse
            {{-- Empty rows --}}
            @for($i = 0; $i < max(0, 10 - $jobOrder->services->count() * 2); $i++)
                <tr>
                    <td>&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            @endfor
        </tbody>
    </table>

    {{-- Recommendation + Road Test Log --}}
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
            <td style="width: 60%; vertical-align: top; border: 1px solid #000; padding: 8px;">
                <div class="section-header" style="margin-top: 0;">Recommendation</div>
                <div style="min-height: 60px; font-size: 9px;">
                    {{ $jobOrder->notes ?? 'No recommendations recorded.' }}
                </div>
            </td>
            <td style="width: 40%; vertical-align: top; border: 1px solid #000; padding: 8px;">
                <div class="section-header" style="margin-top: 0;">Road Test Log</div>
                <table class="road-test-table">
                    <thead>
                        <tr>
                            <th style="width: 40%;">MILAGE</th>
                            <th style="width: 60%;">FUEL</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for($i = 0; $i < 5; $i++)
                            <tr>
                                <td></td>
                                <td>
                                    E <span class="fuel-line"></span> F
                                </td>
                            </tr>
                        @endfor
                    </tbody>
                </table>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
