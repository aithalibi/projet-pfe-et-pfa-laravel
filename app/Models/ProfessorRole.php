<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessorRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'professor_id',
        'role_type'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }
}
