<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    // Tells Laravel the table name is 'zones'
    protected $table = 'zones';
    
    // Tells Laravel the primary key is 'zone_id'
    protected $primaryKey = 'zone_id';                
    
    // Fields that can be mass-assigned
    protected $fillable = ['zone_name', 'description'];

    /**
     * Get the residents assigned to this zone.                
     */
    public function residents(): HasMany
    {
        return $this->hasMany(Resident::class, 'zone_id', 'zone_id');
    }
}