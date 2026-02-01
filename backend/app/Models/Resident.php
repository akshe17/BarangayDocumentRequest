<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
protected $primaryKey = 'resident_id'; //
    protected $fillable = ['user_id', 'gender_id', 'civil_status_id', 'first_name', 'last_name', 'birthdate', 'house_no', 'street']; //

    public function user() { return $this->belongsTo(User::class, 'user_id'); } //
    public function gender() { return $this->belongsTo(Gender::class, 'gender_id'); } //
    public function civilStatus() { return $this->belongsTo(CivilStatus::class, 'civil_status_id'); } //
}
