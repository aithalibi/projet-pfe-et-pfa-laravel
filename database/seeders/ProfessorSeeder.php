<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Professor;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProfessorSeeder extends Seeder
{
    public function run()
    {
        // Créer un département si nécessaire
        $department = Department::firstOrCreate([
            'name' => 'Informatique'
        ]);

        // Créer un utilisateur professeur
        $user = User::create([
            'name' => 'Prof Test',
            'email' => 'professor@test.com',
            'password' => Hash::make('professor123'),
            'role' => 'enseignant'
        ]);

        // Créer le profil professeur
        Professor::create([
            'nom' => 'Test',
            'prenom' => 'Professeur',
            'email' => 'professor@test.com',
            'telephone' => '0123456789',
            'specialite' => 'Informatique',
            'type' => 'permanent',
            'department_id' => $department->id
        ]);
    }
} 