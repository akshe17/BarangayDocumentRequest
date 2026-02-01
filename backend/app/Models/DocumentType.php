<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
  protected $primaryKey = 'document_id'; 
  protected $fillable = ['document_name', 'fee'];
}
