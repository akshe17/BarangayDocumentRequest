<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Verified</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .content { background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Barangay Bonbon Notice</h2>
        </div>
        
        <div class="content">
            <h3>Congratulations!</h3>
            <p>Hello,</p>
            <p>Good news! Your submitted identification document has been reviewed and approved.</p>
            
            <div class="success-box">
                <strong>Your account is now fully verified.</strong>
            </div>
            
            <p>You now have full access to all community services and features. Log in to your dashboard to get started.</p>
            
            <p>Best regards,<br>Community Administration</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Community Website. All rights reserved.</p>
        </div>
    </div>
</body>
</html>