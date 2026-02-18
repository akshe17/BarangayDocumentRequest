<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    protected $primaryKey = 'request_id';
 
    protected $fillable = [
        'resident_id', 
        'status_id', 
        'document_id',
        'last_updated_by', // Added
        'purpose', 
        'request_date', 
        'pickup_date',
        'payment_status',
        'rejection_reason'
    ];
    
    protected $casts = [
        'request_date' => 'datetime',
        'pickup_date' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(RequestItem::class, 'request_id', 'request_id');
    }

    public function status()
    {
        return $this->belongsTo(RequestStatus::class, 'status_id', 'status_id');
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id', 'resident_id');
    }

    public function lastUpdatedBy()
    {
        return $this->belongsTo(User::class, 'last_updated_by', 'user_id');
    }
    public function formData()
    {
        return $this->hasMany(RequestFormData::class, 'request_id', 'request_id');
    }
}