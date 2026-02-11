<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inbox extends Model
{
    // Tells Laravel the table name
    protected $table = 'inbox';                
    
    // Tells Laravel the primary key is 'inbox_id', not 'id'
    protected $primaryKey = 'inbox_id'; 
    
    // $fillable is correct (do not put inbox_id here)
    protected $fillable = ['sender_user_id', 'receiver_user_id', 'title', 'message', 'is_read'];

    public function sender() { return $this->belongsTo(User::class, 'sender_user_id'); }
    public function receiver() { return $this->belongsTo(User::class, 'receiver_user_id'); }
}