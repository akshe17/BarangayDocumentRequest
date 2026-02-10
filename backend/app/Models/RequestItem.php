<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{
    protected $table = 'request_items'; // Make sure this matches your table name
    protected $primaryKey = 'item_id'; // Adjust if your primary key is different
    
    protected $fillable = ['request_id', 'document_id', 'quantity'];

    // Relationship to DocumentRequest
    public function documentRequest()
    {
        return $this->belongsTo(DocumentRequest::class, 'request_id', 'request_id');
    }

    // ADD THIS RELATIONSHIP - This is what's missing!
    public function document()
    {
        return $this->belongsTo(DocumentType::class, 'document_id', 'document_id');
    }
}