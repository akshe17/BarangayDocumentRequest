<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionLog extends Model
{
    protected $table = 'action_logs'; // Renamed table
    protected $primaryKey = 'log_id'; // Renamed PK
    
    // Fillable fields for the log
    protected $fillable = ['user_id', 'request_id', 'action', 'details'];

    // Who performed the action
    public function user() { return $this->belongsTo(User::class, 'user_id'); }
    // Which request was acted upon
    public function documentRequest() { return $this->belongsTo(DocumentRequest::class, 'request_id'); }
    // 3. Get the Resident related to the action (through the request)
public function resident() 
{ 
    return $this->documentRequest->resident(); 
}
}