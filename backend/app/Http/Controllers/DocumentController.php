<?php
namespace App\Http\Controllers;

use App\Models\DocumentType;
use App\Models\DocumentRequirement;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
   public function index()
{
    // Fetch active documents with their requirements AND form fields
    return DocumentType::where('in_use', true)
        ->with(['requirements', 'formFields']) 
        ->get();
}
public function residentCurrentRequest()
{
    $user = auth()->user();
    if (!$user || !$user->resident) {
        return response()->json(['error' => 'Resident profile not found'], 404);
    }

    $residentId = $user->resident->resident_id;
    return DocumentRequest::where('resident_id', $residentId)
            ->with(['status', 'formData'])
            ->orderBy('created_at', 'desc')
            ->get();
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'fee' => 'required|numeric',
            'requirements' => 'array',
        ]);

        return DB::transaction(function () use ($validated) {
            $docType = DocumentType::create([
                'document_name' => $validated['name'],
                'fee' => $validated['fee'],
                'in_use' => true,
            ]);

            if (!empty($validated['requirements'])) {
                foreach ($validated['requirements'] as $req) {
                    $docType->requirements()->create([
                        'requirement_name' => $req['requirement_name'],
                        'description' => $req['description'] ?? null,
                    ]);
                }
            }

            return $docType->load('requirements');
        });
    }

    public function update(Request $request, $id)
    {
        $docType = DocumentType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'fee' => 'required|numeric',
            'requirements' => 'array',
        ]);

        return DB::transaction(function () use ($validated, $docType) {
            $docType->update([
                'document_name' => $validated['name'],
                'fee' => $validated['fee'],
            ]);

            // Sync requirements: delete old, add new
            $docType->requirements()->delete();
            if (!empty($validated['requirements'])) {
                foreach ($validated['requirements'] as $req) {
                    $docType->requirements()->create([
                        'requirement_name' => $req['requirement_name'],
                        'description' => $req['description'] ?? null,
                    ]);
                }
            }

            return $docType->load('requirements');
        });
    }

    public function destroy($id)
    {
        $docType = DocumentType::findOrFail($id);
        
        // Optional: check if in_use before deleting
        if (!$docType->in_use) {
            $docType->delete();
            return response()->json(['message' => 'Deleted successfully']);
        }
        
        return response()->json(['message' => 'Cannot delete active document'], 400);
    }
}