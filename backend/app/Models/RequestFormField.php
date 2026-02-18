<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestFormField extends Model
{
    protected $table = 'request_form_fields';
    protected $primaryKey = 'field_id';

    protected $fillable = [
        'document_id',
        'field_label',
        'field_type',
        'is_required'
    ];

    // Link back to the Document Type (e.g., Barangay Clearance)
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_id', 'document_id');
    }

    // Link to the actual answers submitted by residents
    public function responses(): HasMany
    {
        return $this->hasMany(RequestFormData::class, 'field_id', 'field_id');
    }
}