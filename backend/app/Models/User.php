<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Resident;
use App\Models\Role;
use App\Models\Zone;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'email',
        'password',
        'role_id',
        'zone_id',
        // --- ADDED THESE LINES ---
        'first_name',
        'last_name',
        // -------------------------
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // IMPORTANT: tell Laravel auth to use user_id
    public function getAuthIdentifierName()
    {
        return 'user_id';
    }

    public function resident()
    {
        return $this->hasOne(Resident::class, 'user_id', 'user_id');
    }
    
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class, 'zone_id', 'zone_id');
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}