<?php

namespace App\Http\Controllers;

use App\Models\Professor;
use App\Models\ProfessorRole;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;

class ProfessorController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Professor::query();

            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            $professors = $query->get();
            return response()->json($professors);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des professeurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:professors,email',
            'telephone' => 'required|string|max:20',
            'specialite' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $professor = Professor::create($request->all());
        return response()->json($professor, 201);
    }

    public function show($id)
    {
        $professor = Professor::with('department')->find($id);
        
        if (!$professor) {
            return response()->json(['message' => 'Professeur non trouvé'], 404);
        }

        return response()->json($professor);
    }

    public function update(Request $request, $id)
    {
        $professor = Professor::find($id);

        if (!$professor) {
            return response()->json(['message' => 'Professeur non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:professors,email,' . $id,
            'telephone' => 'sometimes|required|string|max:20',
            'specialite' => 'sometimes|required|string|max:255',
            'department_id' => 'sometimes|required|exists:departments,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $professor->update($request->all());
        return response()->json($professor);
    }

    public function destroy($id)
    {
        $professor = Professor::find($id);

        if (!$professor) {
            return response()->json(['message' => 'Professeur non trouvé'], 404);
        }

        $professor->delete();
        return response()->json(['message' => 'Professeur supprimé avec succès']);
    }

    public function getStudents($id)
    {
        $professor = Professor::findOrFail($id);
        $students = $professor->students()->with('subject')->get();
        return response()->json($students);
    }

    public function addStudent(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $professor = Professor::findOrFail($id);
            $student = Student::findOrFail($request->student_id);

          
            if ($student->supervisor_id) {
                throw new \Exception('Cet étudiant a déjà un encadrant');
            }

            $student->supervisor_id = $id;
            $student->save();

            DB::commit();

            return response()->json($student->load('subject'));
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function removeStudent($professorId, $studentId)
    {
        try {
            DB::beginTransaction();

            $student = Student::where('id', $studentId)
                            ->where('supervisor_id', $professorId)
                            ->firstOrFail();

            $student->supervisor_id = null;
            $student->save();

            DB::commit();

            return response()->json(['message' => 'Étudiant retiré avec succès']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function getAvailableStudents()
    {
        $students = Student::whereNull('supervisor_id')->get();
        return response()->json($students);
    }

    public function assignRole(Request $request, $subjectId)
    {
        try {
            $validated = $request->validate([
                'professor_id' => 'required|exists:professors,id',
                'role_type' => 'required|in:encadrant,president,rapporteur'
            ]);

           
            $existingRole = ProfessorRole::where('subject_id', $subjectId)
                ->where('professor_id', $validated['professor_id'])
                ->first();

            if ($existingRole) {
                return response()->json([
                    'message' => 'Ce professeur a déjà un rôle pour ce sujet'
                ], 422);
            }

          
            $rolesCount = ProfessorRole::where('subject_id', $subjectId)
                ->where('professor_id', $validated['professor_id'])
                ->count();

            if ($rolesCount >= 2) {
                return response()->json([
                    'message' => 'Un professeur ne peut pas avoir plus de deux rôles sur le même sujet'
                ], 422);
            }
            $existingRoleType = ProfessorRole::where('subject_id', $subjectId)
                ->where('role_type', $validated['role_type'])
                ->first();

            if ($existingRoleType) {
                return response()->json([
                    'message' => 'Il y a déjà un professeur avec ce rôle pour ce sujet'
                ], 422);
            }

            $role = ProfessorRole::create([
                'subject_id' => $subjectId,
                'professor_id' => $validated['professor_id'],
                'role_type' => $validated['role_type']
            ]);

            return response()->json([
                'message' => 'Rôle attribué avec succès',
                'role' => $role
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'attribution du rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeRole(Request $request, $subjectId)
    {
        try {
            $validated = $request->validate([
                'professor_id' => 'required|exists:professors,id',
                'role_type' => 'required|in:encadrant,president,rapporteur'
            ]);

            $role = ProfessorRole::where('subject_id', $subjectId)
                ->where('professor_id', $validated['professor_id'])
                ->where('role_type', $validated['role_type'])
                ->first();

            if (!$role) {
                return response()->json([
                    'message' => 'Ce rôle n\'existe pas'
                ], 404);
            }

            $role->delete();

            return response()->json([
                'message' => 'Rôle supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
