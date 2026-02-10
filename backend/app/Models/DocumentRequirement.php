<?php
// app/Models/DocumentRequirement.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequirement extends Model
{
    protected $primaryKey = 'requirement_id';
    protected $fillable = ['document_id', 'requirement_name', 'description'];

    // Link back to the document type
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_id', 'document_id');
    }
}