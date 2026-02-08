<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CivilStatus;
use App\Models\Gender;
use App\Models\User;
class Resident extends Model
{
protected $primaryKey = 'resident_id'; //
protected $fillable = [
    'user_id', 
    'gender_id', 
    'civil_status_id', 
    'first_name', 
    'last_name', 
    'birthdate', 
    'house_no', 
    'zone', 
    'id_image_path',
    'is_active',
    'is_verified'
];

public function user() 
{ 
    return $this->belongsTo(User::class, 'user_id', 'user_id'); 
}
    public function gender() { return $this->belongsTo(Gender::class, 'gender_id'); } //
    public function civilStatus() { return $this->belongsTo(CivilStatus::class, 'civil_status_id'); } //
}
