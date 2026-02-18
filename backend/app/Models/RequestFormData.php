<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestFormData extends Model
{
    protected $table = 'request_form_data';
    protected $primaryKey = 'data_id';

    protected $fillable = [
        'request_id',
        'field_id',
        'field_value'
    ];

    // Link to the specific Document Request
    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequest::class, 'request_id', 'request_id');
    }

    // Link to the field definition to know the Label and Type
    public function fieldDefinition(): BelongsTo
    {
        return $this->belongsTo(RequestFormField::class, 'field_id', 'field_id');
    }
}