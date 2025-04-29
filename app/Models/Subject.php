<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'technologies',
        'student_id',
        'department_id',
        'status'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function roles()
    {
        return $this->hasMany(ProfessorRole::class);
    }

    public function professors()
    {
        return $this->belongsToMany(Professor::class, 'professor_roles')
            ->withPivot('role_type')
            ->withTimestamps();
    }
}
