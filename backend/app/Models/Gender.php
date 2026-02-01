<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gender extends Model
{
 protected $primaryKey = 'gender_id';
  protected $fillable = ['gender_name'];
}
