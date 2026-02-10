<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentRequest;

class DocumentRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purpose' => 'required|string',
            'status_id' => 'required|exists:request_statuses,status_id',
            'document_items' => 'required|array',
            'document_items.*.document_id' => 'required|exists:document_types,document_id',
            'document_items.*.quantity' => 'required|integer|min:1',
        ]);

        // Get the resident relationship from the authenticated user
        $resident = auth()->user()->resident; // Access the relationship
        
        if (!$resident) {
            return response()->json(['message' => 'User is not linked to a resident'], 400);
        }

        $docRequest = DocumentRequest::create([
            'resident_id' => $resident->resident_id, // Use the relationship's resident_id
            'status_id' => $validated['status_id'],
            'purpose' => $validated['purpose'],
            'request_date' => now(),
        ]);

        foreach ($validated['document_items'] as $item) {
            $docRequest->items()->create([
                'document_id' => $item['document_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return response()->json([
            'message' => 'Request created successfully',
            'request' => $docRequest
        ], 201);
    }
}