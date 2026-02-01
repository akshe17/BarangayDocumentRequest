<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inbox extends Model
{
    protected $fillable = ['sender_user_id', 'receiver_user_id', 'title', 'message', 'is_read'];
    public function sender() { return $this->belongsTo(User::class, 'sender_user_id'); }
    public function receiver() { return $this->belongsTo(User::class, 'receiver_user_id'); }
}
