<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestStatus extends Model
{
   
    protected $table = 'request_statuses';
    protected $primaryKey = 'status_id';
    
    protected $fillable = ['status_name', 'description'];

    /**
     * Get all document requests with this status
     */
    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class, 'status_id', 'status_id');
    }

}
