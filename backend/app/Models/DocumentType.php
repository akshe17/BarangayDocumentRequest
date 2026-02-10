<?php
// app/Models/DocumentType.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    protected $primaryKey = 'document_id';
    protected $fillable = ['document_name', 'fee'];

    // Get requirements for this document
    public function requirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class, 'document_id', 'document_id');
    }
}