<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Professor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'specialite',
        'type',
        'department_id'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function roles()
    {
        return $this->hasMany(ProfessorRole::class);
    }

    public function subjects()
    {
        return $this->hasManyThrough(
            Subject::class,
            ProfessorRole::class,
            'professor_id',
            'id',
            'id',
            'subject_id'
        );
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'supervisor_id');
    }
}
