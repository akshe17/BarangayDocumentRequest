<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionLog extends Model
{
  protected $table = 'action_logs'; 
    protected $primaryKey = 'log_id'; 
    
    // --- FIX: Ensure these fields are fillable ---
    protected $fillable = ['user_id', 'request_id', 'action', 'details'];
    // ---------------------------------------------

    public function user() { return $this->belongsTo(User::class, 'user_id'); }
    public function documentRequest() { return $this->belongsTo(DocumentRequest::class, 'request_id'); }

}