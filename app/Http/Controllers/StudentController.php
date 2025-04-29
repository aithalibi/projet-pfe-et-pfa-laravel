<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Student::with('department');
            
            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }
            
            $students = $query->get();
            return response()->json($students);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des étudiants: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la récupération des étudiants: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        DB::enableQueryLog();
        
        try {
            Log::info('Données reçues:', $request->all());

            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:students',
                'type_stage' => 'nullable|in:PFE,PPFA',
                'department_id' => 'required|exists:departments,id'
            ]);

            if ($validator->fails()) {
                Log::warning('Validation échouée:', $validator->errors()->toArray());
                return response()->json(['message' => $validator->errors()->first()], 422);
            }

            $student = Student::create($request->all());
            Log::info('Étudiant créé avec succès:', $student->toArray());
            
            return response()->json($student, 201);
        } catch (\Exception $e) {
            $queries = DB::getQueryLog();
            Log::error('Dernières requêtes SQL:', $queries);
            Log::error('Erreur lors de la création de l\'étudiant: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erreur lors de la création de l\'étudiant',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'sql_queries' => $queries
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $student = Student::find($id);

            if (!$student) {
                return response()->json(['message' => 'Étudiant non trouvé'], 404);
            }

            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email,'.$id,
                'type_stage' => 'nullable|in:PFE,PPFA',
                'department_id' => 'required|exists:departments,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }

            $student->update($request->all());
            return response()->json($student);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de l\'étudiant: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la mise à jour de l\'étudiant: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $student = Student::find($id);
            
            if (!$student) {
                return response()->json(['message' => 'Étudiant non trouvé'], 404);
            }

            $student->delete();
            return response()->json(['message' => 'Étudiant supprimé avec succès']);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'étudiant: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression de l\'étudiant: ' . $e->getMessage()], 500);
        }
    }

    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = Student::where('email', $request->email)->first();
        
        if ($student) {
            return response()->json($student);
        }
        
        return response()->json(null);
    }
}
