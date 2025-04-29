<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Professor;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfessorController extends Controller
{
    public function index(Request $request)
    {
        $department_id = $request->query('department_id');
        $professors = Professor::when($department_id, function($query) use ($department_id) {
            return $query->where('department_id', $department_id);
        })->with('department')->get();

        return response()->json($professors);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Tentative d\'ajout d\'un professeur:', [
                'data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $messages = [
                'nom.required' => 'Le nom est obligatoire',
                'prenom.required' => 'Le prénom est obligatoire',
                'email.required' => 'L\'email est obligatoire',
                'email.email' => 'L\'email doit être une adresse email valide',
                'email.unique' => 'Cet email est déjà utilisé',
                'type.required' => 'Le type est obligatoire',
                'type.in' => 'Le type doit être soit vacataire soit permanent',
                'department_id.required' => 'Le département est obligatoire',
                'department_id.exists' => 'Le département sélectionné n\'existe pas'
            ];

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:professors',
                'type' => ['required', Rule::in(['vacataire', 'permanent'])],
                'department_id' => 'required|exists:departments,id'
            ], $messages);

            $professor = Professor::create($validated);
            \Log::info('Professeur créé:', $professor->toArray());
            return response()->json($professor, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Erreur de validation:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du professeur:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function show(Professor $professor)
    {
        return response()->json($professor->load('department'));
    }

    public function update(Request $request, Professor $professor)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('professors')->ignore($professor->id)],
            'type' => ['required', Rule::in(['vacataire', 'permanent'])],
            'department_id' => 'required|exists:departments,id'
        ]);

        $professor->update($validated);
        return response()->json($professor);
    }

    public function destroy(Professor $professor)
    {
        $professor->delete();
        return response()->json(null, 204);
    }

    public function getDepartments()
    {
        $departments = Department::all();
        return response()->json($departments);
    }
}
