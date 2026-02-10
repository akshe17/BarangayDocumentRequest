<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\RequestItem;
use App\Models\RequestStatus;
use App\Models\Resident;

class DocumentRequest extends Model
{
    protected $primaryKey = 'request_id';
    protected $fillable = ['resident_id', 'status_id', 'purpose', 'request_date', 'pickup_date'];

    // Make sure this relationship exists and matches your table name
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
}