<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
protected $primaryKey = 'request_id'; //
    protected $fillable = ['resident_id', 'status_id', 'purpose', 'request_date', 'pickup_date']; //

    public function items() { return $this->hasMany(RequestItem::class, 'request_id'); } //
    public function status() { return $this->belongsTo(RequestStatus::class, 'status_id'); } //
}