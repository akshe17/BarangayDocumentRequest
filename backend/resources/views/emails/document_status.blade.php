<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Request Update</title>
    <style>
        body  { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; width: 100%; }
        td    { padding: 0; }
        img   { border: 0; }

        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 32px 0 48px; }
        .main    { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #374151; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px -4px rgba(0,0,0,0.12); }

        .header           { padding: 36px 32px; text-align: center; color: #ffffff; }
        .header.approved  { background: linear-gradient(135deg, #1d4ed8, #2563eb); }
        .header.ready     { background: linear-gradient(135deg, #047857, #059669); }
        .header.rejected  { background: linear-gradient(135deg, #b91c1c, #dc2626); }
        .header.completed { background: linear-gradient(135deg, #047857, #10b981); }

        .header-icon { font-size: 36px; margin-bottom: 12px; display: block; }
        .header h1   { margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .header p    { margin: 0; font-size: 13px; opacity: 0.85; }

        .content  { padding: 32px; line-height: 1.65; }
        .greeting { font-size: 17px; font-weight: 600; color: #111827; margin-bottom: 6px; }
        .intro    { font-size: 14px; color: #6b7280; margin-bottom: 24px; }

        .info-card  { background-color: #f8fafc; border-radius: 8px; padding: 20px 24px; margin: 0 0 24px; border: 1px solid #e2e8f0; }
        .info-row   { margin-bottom: 10px; font-size: 13px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 11px; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
        .info-value { color: #111827; font-weight: 500; font-size: 14px; }

        .badge           { display: inline-block; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-approved  { background-color: #dbeafe; color: #1e40af; }
        .badge-ready     { background-color: #d1fae5; color: #065f46; }
        .badge-rejected  { background-color: #fee2e2; color: #991b1b; }
        .badge-completed { background-color: #d1fae5; color: #065f46; }

        .address-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 0 0 24px; }
        .address-box .address-title { font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .address-box .address-value { font-size: 14px; font-weight: 600; color: #1e3a8a; }

        .requirements-box   { background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px; }
        .requirements-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 10px; }
        .requirements-list  { margin: 0; padding: 0; list-style: none; }
        .requirements-list li { font-size: 13px; color: #78350f; padding: 5px 0 5px 24px; position: relative; border-bottom: 1px solid #fde68a; }
        .requirements-list li:last-child { border-bottom: none; }
        .requirements-list li::before { content: "✓"; position: absolute; left: 0; color: #d97706; font-weight: 700; }

        .rejection-box { background-color: #fff5f5; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px; }
        .rejection-label { font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .rejection-text  { font-size: 14px; color: #7f1d1d; line-height: 1.6; }

        .message-block { font-size: 14px; color: #4b5563; margin-bottom: 24px; line-height: 1.7; }

        .btn-wrap { text-align: center; margin: 8px 0 32px; }
        .btn      { display: inline-block; padding: 13px 32px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; }

        .footer      { background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px 32px; }
        .footer p    { font-size: 11px; color: #9ca3af; margin: 4px 0; line-height: 1.5; }
        .footer-bold { font-size: 12px; font-weight: 600; color: #6b7280; }
    </style>
</head>
<body>
<center class="wrapper">
    <table class="main">

        {{-- ══ HEADER ══ --}}
        <tr>
            <td class="header {{ $statusType }}">
                <span class="header-icon">
                    @if($statusType === 'approved') 📋
                    @elseif($statusType === 'ready')     📦
                    @elseif($statusType === 'completed') ✅
                    @else ❌
                    @endif
                </span>
                <h1>
                    @if($statusType === 'approved')      Request Approved
                    @elseif($statusType === 'ready')     Ready for Pickup
                    @elseif($statusType === 'completed') Request Completed
                    @else                                Request Rejected
                    @endif
                </h1>
                <p>Document request status update</p>
            </td>
        </tr>

        {{-- ══ BODY ══ --}}
        <tr>
            <td class="content">

                <p class="greeting">Hello, {{ $documentRequest->resident->user->first_name }}!</p>
                <p class="intro">There has been an update on your document request. Please review the details below.</p>

                {{-- ── Request summary card ── --}}
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Document</span>
                        <span class="info-value">{{ $documentRequest->documentType->document_name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Request ID</span>
                        <span class="info-value">REQ-{{ str_pad($documentRequest->request_id, 4, '0', STR_PAD_LEFT) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Current Status</span>
                        <span class="info-value">
                            @if($statusType === 'approved')
                                <span class="badge badge-approved">Approved</span>
                            @elseif($statusType === 'ready')
                                <span class="badge badge-ready">Ready for Pickup</span>
                            @elseif($statusType === 'completed')
                                <span class="badge badge-completed">Completed</span>
                            @else
                                <span class="badge badge-rejected">Rejected</span>
                            @endif
                        </span>
                    </div>
                    @if(in_array($statusType, ['approved', 'ready']) && $documentRequest->pickup_date)
                    <div class="info-row">
                        <span class="info-label">Pickup Date</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($documentRequest->pickup_date)->format('F j, Y') }}</span>
                    </div>
                    @endif
                    @if($documentRequest->documentType->fee && (float)$documentRequest->documentType->fee > 0)
                    <div class="info-row">
                        <span class="info-label">Fee</span>
                        <span class="info-value">₱{{ number_format((float)$documentRequest->documentType->fee, 2) }}</span>
                    </div>
                    @endif
                </div>

                {{-- ── Pickup address (zone leader emails only) ── --}}
                @if(!empty($zoneLeaderAddress))
                <div class="address-box">
                    <div class="address-title">📍 Pickup Location — Zone Leader's Address</div>
                    <div class="address-value">{{ $zoneLeaderAddress }}</div>
                </div>
                @endif

                {{-- ── Requirements checklist — shown on approved & ready only ── --}}
                @if(in_array($statusType, ['approved', 'ready']))
                <div class="requirements-box">
                    <div class="requirements-title">📋 Bring your requirements when you claim:</div>
                    <ul class="requirements-list">
                        @forelse($requirements as $req)
                            <li>{{ $req }}</li>
                        @empty
                            <li>Valid government-issued ID</li>
                        @endforelse
                    </ul>
                </div>
                @endif

                {{-- ── Status-specific message ── --}}
                @if($statusType === 'approved')
                    <div class="message-block">
                        Your request has been <strong>approved</strong> and a pickup date has been scheduled.
                        Please visit the pickup location on your scheduled date and bring the requirements listed above.
                        @if(empty($zoneLeaderAddress))
                            Please visit the <strong>Barangay Hall</strong> during business hours (8:00 AM – 5:00 PM).
                        @endif
                    </div>

                @elseif($statusType === 'ready')
                    <div class="message-block">
                        Great news! Your document is <strong>ready for pickup</strong>.
                        @if(!empty($zoneLeaderAddress))
                            You may claim it at the zone leader's address listed above during regular hours.
                        @else
                            You may claim it at the <strong>Barangay Hall</strong> during business hours (8:00 AM – 5:00 PM).
                        @endif
                        Please bring the requirements listed above and prepare your payment of
                        @if($documentRequest->documentType->fee && (float)$documentRequest->documentType->fee > 0)
                            <strong>₱{{ number_format((float)$documentRequest->documentType->fee, 2) }}</strong>.
                        @else
                            the required fee.
                        @endif
                    </div>

                @elseif($statusType === 'completed')
                    <div class="message-block">
                        Your document request has been marked as <strong>completed</strong>.
                        Thank you for transacting with us. If you need another copy or have any concerns,
                        feel free to visit the office.
                    </div>

                @elseif($statusType === 'rejected')
                    @if($reason)
                    <div class="rejection-box">
                        <div class="rejection-label">Reason for Rejection</div>
                        <div class="rejection-text">{{ $reason }}</div>
                    </div>
                    @endif
                    <div class="message-block">
                        Unfortunately your request was <strong>not approved</strong> at this time.
                        If you believe this is a mistake or would like to clarify, please visit the office
                        or submit a new request with the correct information.
                    </div>
                @endif

                {{-- ── CTA ── --}}
                <div class="btn-wrap">
                    <a href="{{ config('app.url') }}" class="btn">View Request Portal</a>
                </div>

            </td>
        </tr>

        {{-- ══ FOOTER ══ --}}
        <tr>
            <td class="footer">
                <p class="footer-bold">{{ config('app.name') }}</p>
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                <p>This is an automated notification. Please do not reply directly to this email.</p>
            </td>
        </tr>

    </table>
</center>
</body>
</html>