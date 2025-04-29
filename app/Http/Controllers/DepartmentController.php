<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class DepartmentController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Display a listing of the departments.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $departments = Department::withCount('professors')->get();
            
            // Log pour le débogage
            Log::info('Departments retrieved successfully', [
                'count' => $departments->count(),
                'departments' => $departments->toArray()
            ]);
            
            return response()->json([
                'status' => 'success',
                'data' => $departments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching departments', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la récupération des départements',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created department in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments',
                'code' => 'required|string|max:10|unique:departments',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = Department::create([
                'name' => $request->name,
                'code' => strtoupper($request->code),
                'description' => $request->description
            ]);

            Log::info('Department created successfully', ['department' => $department->toArray()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Department created successfully',
                'data' => $department
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error creating department', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la création du département',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified department.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $department = Department::with(['professors', 'subjects'])
                ->withCount('professors')
                ->findOrFail($id);

            Log::info('Department retrieved successfully', ['department' => $department->toArray()]);

            return response()->json([
                'status' => 'success',
                'data' => $department
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Department not found', ['id' => $id]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Département non trouvé'
            ], 404);
            
        } catch (\Exception $e) {
            Log::error('Error retrieving department', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la récupération du département',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified department in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $department = Department::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments,name,' . $id,
                'code' => 'required|string|max:10|unique:departments,code,' . $id,
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department->update([
                'name' => $request->name,
                'code' => strtoupper($request->code),
                'description' => $request->description
            ]);

            Log::info('Department updated successfully', ['department' => $department->toArray()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Department updated successfully',
                'data' => $department
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Department not found for update', ['id' => $id]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Département non trouvé'
            ], 404);
            
        } catch (\Exception $e) {
            Log::error('Error updating department', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la mise à jour du département',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified department from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $department = Department::findOrFail($id);
            $department->delete();

            Log::info('Department deleted successfully', ['id' => $id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Department deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Department not found for deletion', ['id' => $id]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Département non trouvé'
            ], 404);
            
        } catch (\Exception $e) {
            Log::error('Error deleting department', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la suppression du département',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
