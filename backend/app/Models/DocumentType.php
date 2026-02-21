<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $table = 'document_types';
    protected $primaryKey = 'document_id';
    
    protected $fillable = ['document_name', 'fee', 'in_use',   'template_path'];

    public function requirements()
    {
        return $this->hasMany(DocumentRequirement::class, 'document_id', 'document_id');
    }

    public function formFields()
    {
        return $this->hasMany(RequestFormField::class, 'document_id', 'document_id');
    }

    public function requests()
    {
        return $this->hasMany(DocumentRequest::class, 'document_id', 'document_id');
    }

   
}