<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Reset for email clients */
        body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }

        .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #374151; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        /* Header Colors based on status */
        .header { padding: 40px 20px; text-align: center; color: #ffffff; }
        .header.approved { background-color: #2563eb; } /* Blue */
        .header.ready { background-color: #059669; }    /* Green */
        .header.rejected { background-color: #dc2626; } /* Red */
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }

        .content { padding: 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 15px; }
        
        /* Info Table */
        .info-card { background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .info-row { display: table; width: 100%; margin-bottom: 8px; }
        .info-label { display: table-cell; font-weight: 600; color: #6b7280; width: 40%; font-size: 13px; text-transform: uppercase; }
        .info-value { display: table-cell; color: #111827; font-weight: 500; }

        /* Status Badge */
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-approved { background-color: #dbeafe; color: #1e40af; }
        .badge-ready { background-color: #d1fae5; color: #065f46; }
        .badge-rejected { background-color: #fee2e2; color: #991b1b; }

        .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main">
            <tr>
                <td class="header {{ $statusType }}">
                    <h1>Document Update</h1>
                </td>
            </tr>

            <tr>
                <td class="content">
                    <p class="greeting">Hello, {{ $documentRequest->resident->user->first_name }}!</p>
                    <p>There has been a change in the status of your document request. Please see the details below:</p>

                    <div class="info-card">
                        <div class="info-row">
                            <span class="info-label">Document:</span>
                            <span class="info-value">{{ $documentRequest->documentType->document_name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Current Status:</span>
                            <span class="info-value">
                                @if($statusType === 'approved')
                                    <span class="badge badge-approved">Approved</span>
                                @elseif($statusType === 'ready')
                                    <span class="badge badge-ready">Ready for Pickup</span>
                                @else
                                    <span class="badge badge-rejected">Rejected</span>
                                @endif
                            </span>
                        </div>
                        @if($statusType === 'approved' || $statusType === 'ready')
                        <div class="info-row">
                            <span class="info-label">Pickup Date:</span>
                            <span class="info-value">{{ \Carbon\Carbon::parse($documentRequest->pickup_date)->format('F j, Y') }}</span>
                        </div>
                        @endif
                    </div>

                    @if($statusType === 'approved')
                        <p>Your request has been processed. Please visit the Barangay Hall on your scheduled pickup date. <strong>Don't forget to bring a valid ID.</strong></p>
                    @elseif($statusType === 'ready')
                        <p>Great news! Your document is printed and signed. You may claim it at the office during business hours (8:00 AM - 5:00 PM).</p>
                    @elseif($statusType === 'rejected')
                        <p style="color: #dc2626;"><strong>Reason for Rejection:</strong> {{ $reason }}</p>
                        <p>If you have any questions, feel free to visit our office to clarify the requirements.</p>
                    @endif

                    <center>
                        <a href="{{ config('app.url') }}" class="btn">View Request Portal</a>
                    </center>
                </td>
            </tr>

            <tr>
                <td class="footer">
                    <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                    <p>This is an automated notification. Please do not reply directly to this email.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>