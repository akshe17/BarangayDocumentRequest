<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Update</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .content { background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .reason-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Barangay Bonbon Update</h2>
        </div>
        
        <div class="content">
            <h3>Application Update</h3>
            <p>Hello,</p>
            <p>Thank you for registering with our community directory. We have reviewed your submitted identification document.</p>
            
            <p>Unfortunately, your application was not approved for the following reason:</p>
            
            <div class="reason-box">
                <strong>{{ $reason }}</strong>
            </div>
            
            <p>Please log in to your dashboard to update your document and re-submit your application.</p>
            
            <p>Best regards,<br>Community Administration</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Community Website. All rights reserved.</p>
        </div>
    </div>
</body>
</html>