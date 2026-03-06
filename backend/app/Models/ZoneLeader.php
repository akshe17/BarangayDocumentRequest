<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoneLeader extends Model
{
    use HasFactory;

    // Define the custom primary key from your migration
    protected $primaryKey = 'zone_leader_id';

    // Fields that can be mass-assigned
    protected $fillable = [
        'user_id',
        'zone_id',
        'house_no',

    ];

    /**
     * Get the User associated with this Zone Leader.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'user_id', 'user_id');
    }

    /**
     * Get the Zone this leader is assigned to.
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'zone_id', 'zone_id');
    }
}