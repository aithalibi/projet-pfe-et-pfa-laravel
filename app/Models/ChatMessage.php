<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'professor_id',
        'student_id',
        'message',
        'sender_type',
        'is_read'
    ];

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
} 