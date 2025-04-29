<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Professor;
use App\Models\ProfessorRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProfessorRoleController extends Controller
{
    public function index(Subject $subject)
    {
        $roles = ProfessorRole::with('professor')
            ->where('subject_id', $subject->id)
            ->get();
        
        return response()->json($roles);
    }

    public function store(Request $request, Subject $subject)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*.professor_id' => 'required|exists:professors,id',
            'roles.*.role_type' => 'required|in:encadrant,rapporteur,president'
        ]);

        try {
            DB::beginTransaction();

            // Supprimer les anciens rôles
            ProfessorRole::where('subject_id', $subject->id)->delete();

            // Vérifier qu'il y a un encadrant
            $hasEncadrant = false;
            foreach ($request->roles as $role) {
                if ($role['role_type'] === 'encadrant') {
                    $hasEncadrant = true;
                    break;
                }
            }

            if (!$hasEncadrant) {
                throw new \Exception('Un encadrant est obligatoire');
            }

        
            $rolesParProfesseur = [];
            foreach ($request->roles as $role) {
                $profId = $role['professor_id'];
                $rolesParProfesseur[$profId] = ($rolesParProfesseur[$profId] ?? 0) + 1;
                
                if ($rolesParProfesseur[$profId] > 2) {
                    throw new \Exception('Un professeur ne peut pas avoir plus de deux rôles sur le même sujet');
                }
            }

            // Créer les nouveaux rôles
            foreach ($request->roles as $role) {
                ProfessorRole::create([
                    'subject_id' => $subject->id,
                    'professor_id' => $role['professor_id'],
                    'role_type' => $role['role_type']
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Rôles attribués avec succès']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Subject $subject, Professor $professor)
    {
        try {
            $role = ProfessorRole::where('subject_id', $subject->id)
                ->where('professor_id', $professor->id)
                ->firstOrFail();

            if ($role->role_type === 'encadrant') {
                // Vérifier s'il y a d'autres rôles
                $otherRoles = ProfessorRole::where('subject_id', $subject->id)
                    ->where('professor_id', '!=', $professor->id)
                    ->exists();

                if (!$otherRoles) {
                    return response()->json(['message' => 'Impossible de supprimer l\'encadrant sans le remplacer'], 400);
                }
            }

            $role->delete();
            return response()->json(['message' => 'Rôle supprimé avec succès']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Rôle non trouvé'], 404);
        }
    }
}
