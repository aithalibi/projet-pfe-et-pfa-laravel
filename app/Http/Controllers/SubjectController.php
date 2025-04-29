<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\ProfessorRole;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Subject::with(['roles.professor', 'student']);
            
            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }
            
            $subjects = $query->get();

            $subjects = $subjects->map(function ($subject) {
                $roles = [
                    'encadrant' => null,
                    'president' => null,
                    'rapporteur' => null
                ];

                foreach ($subject->roles as $role) {
                    $roles[$role->role_type] = [
                        'id' => $role->professor->id,
                        'nom' => $role->professor->nom,
                        'prenom' => $role->professor->prenom
                    ];
                }

                return [
                    'id' => $subject->id,
                    'title' => $subject->title,
                    'description' => $subject->description,
                    'technologies' => $subject->technologies,
                    'status' => $subject->status,
                    'student' => $subject->student,
                    'roles' => $roles,
                    'department_id' => $subject->department_id
                ];
            });

            return response()->json($subjects);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la récupération des sujets', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'technologies' => 'required|string',
                'department_id' => 'required|exists:departments,id',
                'student_id' => 'nullable|exists:students,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $subject = Subject::create([
                'title' => $request->title,
                'description' => $request->description,
                'technologies' => $request->technologies,
                'department_id' => $request->department_id,
                'student_id' => $request->student_id,
                'status' => 'pending'
            ]);

            DB::commit();

            $subject->load(['student', 'department', 'roles.professor']);
            
            return response()->json([
                'message' => 'Sujet créé avec succès',
                'subject' => $subject
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Erreur lors de la création du sujet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $subject = Subject::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'technologies' => 'required|string',
                'department_id' => 'required|exists:departments,id',
                'student_id' => 'nullable|exists:students,id',
                'status' => 'nullable|in:pending,approved,rejected'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $updateData = [
                'title' => $request->title,
                'description' => $request->description,
                'technologies' => $request->technologies,
                'department_id' => $request->department_id,
                'student_id' => $request->student_id
            ];

            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            $subject->update($updateData);

            DB::commit();

            $subject->load(['student', 'department', 'roles.professor']);
            
            return response()->json([
                'message' => 'Sujet mis à jour avec succès',
                'subject' => $subject
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Sujet non trouvé'], 404);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du sujet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subject = Subject::findOrFail($id);
            
            DB::beginTransaction();
            
            // Supprimer d'abord les rôles associés
            ProfessorRole::where('subject_id', $id)->delete();
            
            // Puis supprimer le sujet
            $subject->delete();
            
            DB::commit();
            
            return response()->json(['message' => 'Sujet supprimé avec succès']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Sujet non trouvé'], 404);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Erreur lors de la suppression du sujet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignRoles(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'roles' => 'required|array',
                'roles.*.professor_id' => 'required|exists:professors,id',
                'roles.*.role_type' => 'required|in:encadrant,president,rapporteur'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $subject = Subject::findOrFail($id);

            // Vérifier qu'il y a un encadrant
            $hasEncadrant = collect($request->roles)->contains('role_type', 'encadrant');
            if (!$hasEncadrant) {
                return response()->json([
                    'message' => 'Un encadrant est requis'
                ], 422);
            }

            DB::beginTransaction();

            // Supprimer les rôles existants
            ProfessorRole::where('subject_id', $id)->delete();

            // Créer les nouveaux rôles
            foreach ($request->roles as $role) {
                ProfessorRole::create([
                    'subject_id' => $id,
                    'professor_id' => $role['professor_id'],
                    'role_type' => $role['role_type']
                ]);
            }

            DB::commit();

            $subject->load(['roles.professor']);
            return response()->json([
                'message' => 'Rôles attribués avec succès',
                'subject' => $subject
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Sujet non trouvé'], 404);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Erreur lors de l\'attribution des rôles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $subject = Subject::with(['student', 'department', 'roles.professor'])->find($id);
            if (!$subject) {
                return response()->json(['message' => 'Sujet non trouvé'], 404);
            }
            return response()->json($subject);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Sujet non trouvé', 'error' => $e->getMessage()], 404);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $subject = Subject::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,approved,rejected',
                'department_id' => 'required|exists:departments,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $subject->update([
                'status' => $request->status
            ]);

            DB::commit();

            $subject->load(['student', 'department', 'roles.professor']);
            
            return response()->json([
                'message' => 'Statut du sujet mis à jour avec succès',
                'subject' => $subject
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Sujet non trouvé'], 404);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
