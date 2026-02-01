<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{protected $primaryKey = 'item_id'; //
    protected $fillable = ['request_id', 'document_id', 'quantity']; //

    public function type() { return $this->belongsTo(DocumentType::class, 'document_id'); } //
}
