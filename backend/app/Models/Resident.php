<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CivilStatus;
use App\Models\Gender;
use App\Models\User;
use App\Models\Zone; // Added import

class Resident extends Model
{
    protected $primaryKey = 'resident_id';
    
    protected $fillable = [
        'user_id', 
        'gender_id', 
        'civil_status_id',
       
        'birthdate', 
        'house_no', 
        'id_image_path',
      
        'is_verified'
        // --- REMOVED NAMES FROM HERE ---
    ];

    public function requests()
    {
        return $this->hasMany(DocumentRequest::class, 'resident_id', 'resident_id');
    }

    public function user() 
    { 
        return $this->belongsTo(User::class, 'user_id', 'user_id'); 
    }

    public function gender() { return $this->belongsTo(Gender::class, 'gender_id', 'gender_id'); }
    public function civilStatus() { return $this->belongsTo(CivilStatus::class, 'civil_status_id', 'civil_status_id'); }
    
   
}