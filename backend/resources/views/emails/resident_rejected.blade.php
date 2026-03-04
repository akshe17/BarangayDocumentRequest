<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Rejected</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 32px 16px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .header-icon { font-size: 36px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; }
    .body { background: #fff; padding: 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .message { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
    .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .reason-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #b91c1c; margin-bottom: 6px; }
    .reason-text { font-size: 14px; color: #7f1d1d; font-weight: 500; line-height: 1.6; }
    .info-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .info-box p { font-size: 13px; color: #78350f; line-height: 1.6; }
    .cta-wrap { text-align: center; margin-bottom: 8px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff !important; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 36px; border-radius: 12px; }
    .footer { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.6; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">&#x274C;</div>
      <h1>Verification Rejected</h1>
      <p>Your ID document could not be verified</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, {{ $firstName }}!</p>
      <p class="message">
        Unfortunately, your submitted ID document was reviewed and could not be approved by your Zone Leader.
        Please see the reason below and resubmit a corrected document.
      </p>
      <div class="reason-box">
        <div class="reason-label">Reason for Rejection</div>
        <div class="reason-text">{{ $reason }}</div>
      </div>
      <div class="info-box">
        <p>&#x1F4A1; <strong>What to do next:</strong> Log in to the portal, go to your profile, and resubmit a clear, valid, and unexpired government-issued ID photo.</p>
      </div>
      <div class="cta-wrap">
        <a href="{{ $loginUrl }}" class="cta-btn">Log In &amp; Resubmit &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from the<br /><strong>Barangay Bonbon Document Request System</strong>.<br />Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>