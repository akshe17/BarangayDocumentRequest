<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'resident_id',
        'role_id',
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
        return $this->belongsTo(Resident::class, 'resident_id', 'resident_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
