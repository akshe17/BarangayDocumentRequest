<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Resident Pending Review</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #10b981; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; color: #374151; line-height: 1.6; }
        h2 { margin-top: 0; color: #111827; font-size: 24px; }
        p { margin-bottom: 20px; font-size: 16px; }
        .highlight { color: #10b981; font-weight: 600; }
        .details-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
        .details-box ul { margin: 0; padding-left: 20px; }
        .details-box li { margin-bottom: 10px; }
        /* Image Style */
        .id-image { max-width: 200px; height: auto; border-radius: 4px; border: 1px solid #e5e7eb; margin-top: 10px; }
        .footer { padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">New Resident Alert</h1>
        </div>
        <div class="content">
            <h2>Hello, {{ $leader->first_name }}!</h2>
            <p>A new resident has registered in your zone: <span class="highlight">{{ $resident->zone->zone_name }}</span>.</p>
            
            <div class="details-box">
                <p style="margin-top: 0; font-weight: 600; color: #111827;">Resident Details:</p>
                <ul>
                    <li><strong>Name:</strong> {{ $resident->first_name }} {{ $resident->last_name }}</li>
                    <li><strong>Email:</strong> {{ $resident->email }}</li>
                </ul>

                <p style="font-weight: 600; color: #111827; margin-bottom: 5px;">Submitted ID Image:</p>
                @php
                    // Access the resident record to get the image path
                    $residentRecord = $resident->resident; 
                @endphp
                @if($residentRecord && $residentRecord->id_image_path)
                    <img src="{{ asset('storage/' . $residentRecord->id_image_path) }}" alt="Resident ID" class="id-image">
                @else
                    <p>No image submitted.</p>
                @endif
                </div>

            <p>Please log in to the portal to review their documents and verify their account.</p>
            <p>Regards,<br>System Administrator</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Community Portal. All rights reserved.</p>
        </div>
    </div>
</body>
</html>