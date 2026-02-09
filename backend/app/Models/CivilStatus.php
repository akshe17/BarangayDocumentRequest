<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Resident;
class CivilStatus extends Model
{
 protected $primaryKey = 'civil_status_id';
  protected $fillable = ['status_name'];
}
