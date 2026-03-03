<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Resident Registration</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 32px 16px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .header-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 26px; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 6px; }
    .body { background: #fff; padding: 28px 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
    .greeting { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 12px; }
    .message { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
    .info-card-header { background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; }
    .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .info-row:last-child { border-bottom: none; }
    .info-icon { width: 28px; height: 28px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
    .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 2px; }
    .info-value { font-size: 13px; font-weight: 600; color: #1e293b; }
    .badge-pending { display: inline-flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; }
    .badge-dot { width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; display: inline-block; }
    .cta-wrap { text-align: center; margin-bottom: 24px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff !important; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; }
    .notice { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #065f46; line-height: 1.5; }
    .footer { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.6; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">&#x1F514;</div>
      <h1>New Resident Registration</h1>
      <p>A resident in your zone is awaiting verification</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, {{ $leaderName }}!</p>
      <p class="message">A new resident has registered under your zone and is awaiting ID verification. Please review their submitted ID document and either approve or reject their account.</p>
      <div class="info-card">
        <div class="info-card-header">Resident Information</div>
        <div class="info-row">
          <div class="info-icon">&#x1F464;</div>
          <div><div class="info-label">Full Name</div><div class="info-value">{{ $residentName }}</div></div>
        </div>
        <div class="info-row">
          <div class="info-icon">&#x2709;</div>
          <div><div class="info-label">Email Address</div><div class="info-value">{{ $residentEmail }}</div></div>
        </div>
        <div class="info-row">
          <div class="info-icon">&#x1F4CD;</div>
          <div><div class="info-label">Zone</div><div class="info-value">Zone {{ $zoneId }}</div></div>
        </div>
        <div class="info-row">
          <div class="info-icon">&#x1F550;</div>
          <div><div class="info-label">Registered At</div><div class="info-value">{{ $registeredAt }}</div></div>
        </div>
        <div class="info-row">
          <div class="info-icon">&#x1F50E;</div>
          <div><div class="info-label">Status</div><div class="info-value"><span class="badge-pending"><span class="badge-dot"></span>Pending Verification</span></div></div>
        </div>
      </div>
      <div class="cta-wrap">
        <a href="{{ $reviewUrl }}" class="cta-btn">Review Resident &rarr;</a>
      </div>
      <div class="notice">
        <strong>What to do:</strong> Log in to the Barangay system, open the Zone Residents page, find <strong>{{ $residentName }}</strong>, and review their uploaded ID. Approve if valid, or reject with a reason so they can resubmit.
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from the<br /><strong>Barangay Bonbon Document Request System</strong>.<br />Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>