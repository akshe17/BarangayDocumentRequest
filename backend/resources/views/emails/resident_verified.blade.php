<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Account Verified</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 32px 16px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .header-icon { font-size: 36px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; }
    .body { background: #fff; padding: 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .message { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
    .success-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .success-box p { font-size: 13px; color: #065f46; line-height: 1.6; }
    .cta-wrap { text-align: center; margin-bottom: 8px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff !important; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 36px; border-radius: 12px; }
    .footer { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.6; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">&#x2705;</div>
      <h1>Account Verified!</h1>
      <p>You can now access the Barangay portal</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, {{ $firstName }}!</p>
      <p class="message">
        Great news! Your account and submitted ID have been reviewed and verified by your Zone Leader.
        Your account is now fully active and you can start requesting barangay documents.
      </p>
      <div class="success-box">
        <p>&#x1F4CB; <strong>What you can do now:</strong> Log in to the portal and request documents such as Barangay Clearance, Certificates of Residency, and more.</p>
      </div>
      <div class="cta-wrap">
        <a href="{{ $loginUrl }}" class="cta-btn">Log In Now &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from the<br /><strong>Barangay Bonbon Document Request System</strong>.<br />Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>