<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Models\DocumentRequirement;
use App\Models\RequestFormField;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminDocumentController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // GET /api/document-types
    // ─────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = DocumentType::with(['requirements', 'formFields'])
            ->orderBy('document_name');

        if ($request->filled('search')) {
            $query->where('document_name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('in_use', $request->status === 'active' ? 1 : 0);
        }

        return response()->json($query->get());
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/document-types/{id}
    // ─────────────────────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $doc = DocumentType::with(['requirements', 'formFields'])->findOrFail($id);
        return response()->json($doc);
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/document-types
    // Accepts multipart/form-data so we can receive the template file.
    // ─────────────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'document_name'                   => 'required|string|max:255|unique:document_types,document_name',
            'fee'                             => 'required|numeric|min:0',
            'in_use'                          => 'sometimes|boolean',

            // Optional template file
            'template_file'                   => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:10240',

            'requirements'                    => 'sometimes|array',
            'requirements.*.requirement_name' => 'required_with:requirements|string|max:255',
            'requirements.*.description'      => 'nullable|string|max:1000',

            'form_fields'                     => 'sometimes|array',
            'form_fields.*.field_label'       => 'required_with:form_fields|string|max:255',
            'form_fields.*.field_type'        => ['required_with:form_fields', Rule::in(['text', 'textarea', 'date', 'number'])],
            'form_fields.*.is_required'       => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Handle file upload
            $templatePath = null;
            if ($request->hasFile('template_file')) {
                // Stored at storage/app/public/document_templates/{filename}
                // Run: php artisan storage:link  to serve via /storage/...
                $templatePath = $request->file('template_file')
                    ->store('document_templates', 'public');
            }

            $doc = DocumentType::create([
                'document_name' => $request->document_name,
                'fee'           => $request->fee,
                'in_use'        => $request->input('in_use', 1),
                'template_path' => $templatePath,
            ]);

            foreach ($request->input('requirements', []) as $req) {
                $doc->requirements()->create([
                    'requirement_name' => $req['requirement_name'],
                    'description'      => $req['description'] ?? null,
                ]);
            }

            foreach ($request->input('form_fields', []) as $field) {
                $doc->formFields()->create([
                    'field_label' => $field['field_label'],
                    'field_type'  => $field['field_type'],
                    'is_required' => $field['is_required'] ?? true,
                ]);
            }

            DB::commit();
            return response()->json($doc->load(['requirements', 'formFields']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create document type.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/document-types/{id}  (with _method=PUT spoofing)
    // Full update — syncs requirements, form fields, and optional file.
    // We use POST because browsers/axios can't send multipart PUT.
    // ─────────────────────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        $doc = DocumentType::with(['requirements', 'formFields'])->findOrFail($id);

        $request->validate([
            'document_name'                     => [
                'required', 'string', 'max:255',
                Rule::unique('document_types', 'document_name')->ignore($id, 'document_id'),
            ],
            'fee'                               => 'required|numeric|min:0',
            'in_use'                            => 'sometimes|boolean',

            'template_file'                     => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:10240',
            'remove_template'                   => 'sometimes|boolean',

            'requirements'                      => 'sometimes|array',
            'requirements.*.requirement_id'     => 'sometimes|nullable|integer',
            'requirements.*.requirement_name'   => 'required_with:requirements|string|max:255',
            'requirements.*.description'        => 'nullable|string|max:1000',

            'form_fields'                       => 'sometimes|array',
            'form_fields.*.field_id'            => 'sometimes|nullable|integer',
            'form_fields.*.field_label'         => 'required_with:form_fields|string|max:255',
            'form_fields.*.field_type'          => ['required_with:form_fields', Rule::in(['text', 'textarea', 'date', 'number'])],
            'form_fields.*.is_required'         => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            // ── Handle file ────────────────────────────────────────────
            $templatePath = $doc->template_path; // keep existing by default

            if ($request->hasFile('template_file')) {
                // Delete old file if it exists
                if ($doc->template_path) {
                    Storage::disk('public')->delete($doc->template_path);
                }
                $templatePath = $request->file('template_file')
                    ->store('document_templates', 'public');

            } elseif ($request->boolean('remove_template')) {
                // User explicitly removed the file
                if ($doc->template_path) {
                    Storage::disk('public')->delete($doc->template_path);
                }
                $templatePath = null;
            }

            // ── Update base record ─────────────────────────────────────
            $doc->update([
                'document_name' => $request->document_name,
                'fee'           => $request->fee,
                'in_use'        => $request->input('in_use', $doc->in_use),
                'template_path' => $templatePath,
            ]);

            // ── Sync requirements ──────────────────────────────────────
            $incomingReqs = $request->input('requirements', []);
            $keepReqIds   = collect($incomingReqs)->pluck('requirement_id')->filter()->values();

            $doc->requirements()->whereNotIn('requirement_id', $keepReqIds)->delete();

            foreach ($incomingReqs as $req) {
                if (!empty($req['requirement_id'])) {
                    DocumentRequirement::where('requirement_id', $req['requirement_id'])
                        ->where('document_id', $id)
                        ->update([
                            'requirement_name' => $req['requirement_name'],
                            'description'      => $req['description'] ?? null,
                        ]);
                } else {
                    $doc->requirements()->create([
                        'requirement_name' => $req['requirement_name'],
                        'description'      => $req['description'] ?? null,
                    ]);
                }
            }

            // ── Sync form fields ───────────────────────────────────────
            $incomingFields  = $request->input('form_fields', []);
            $keepFieldIds    = collect($incomingFields)->pluck('field_id')->filter()->values();

            $doc->formFields()
                ->whereNotIn('field_id', $keepFieldIds)
                ->get()
                ->each(function ($field) {
                    if ($field->responses()->count() === 0) {
                        $field->delete();
                    }
                });

            foreach ($incomingFields as $fieldData) {
                if (!empty($fieldData['field_id'])) {
                    RequestFormField::where('field_id', $fieldData['field_id'])
                        ->where('document_id', $id)
                        ->update([
                            'field_label' => $fieldData['field_label'],
                            'field_type'  => $fieldData['field_type'],
                            'is_required' => $fieldData['is_required'] ?? true,
                        ]);
                } else {
                    $doc->formFields()->create([
                        'field_label' => $fieldData['field_label'],
                        'field_type'  => $fieldData['field_type'],
                        'is_required' => $fieldData['is_required'] ?? true,
                    ]);
                }
            }

            DB::commit();
            return response()->json($doc->fresh(['requirements', 'formFields']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update document type.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // PATCH /api/document-types/{id}
    // Quick toggle — only updates in_use (JSON, not multipart)
    // ─────────────────────────────────────────────────────────────────────
    public function patch(Request $request, int $id): JsonResponse
    {
        $doc = DocumentType::findOrFail($id);

        $validated = $request->validate([
            'in_use' => 'required|boolean',
        ]);

        $doc->update(['in_use' => $validated['in_use']]);

        return response()->json($doc);
    }

    // ─────────────────────────────────────────────────────────────────────
    // DELETE /api/document-types/{id}
    // Blocked if has requests; also deletes the stored file.
    // ─────────────────────────────────────────────────────────────────────
    public function destroy(int $id): JsonResponse
    {
        $doc = DocumentType::withCount('requests')->findOrFail($id);

        if ($doc->requests_count > 0) {
            return response()->json([
                'message' => 'Cannot delete: this document type has existing requests. Disable it instead.',
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Delete the template file from storage
            if ($doc->template_path) {
                Storage::disk('public')->delete($doc->template_path);
            }

            $doc->requirements()->delete();

            $doc->formFields()->each(function ($field) {
                if ($field->responses()->count() === 0) {
                    $field->delete();
                }
            });

            $doc->delete();

            DB::commit();
            return response()->json(null, 204);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}