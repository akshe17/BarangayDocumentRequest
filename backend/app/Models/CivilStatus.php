<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CivilStatus extends Model
{
 protected $primaryKey = 'civil_status_id';
  protected $fillable = ['status_name'];
}
