<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ProfessorRoleController;
use App\Http\Controllers\ChatController;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Chat
    Route::get('/chat/{professorId}/{studentId}', [ChatController::class, 'getMessages']);
    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::put('/chat/mark-read/{messageId}', [ChatController::class, 'markAsRead']);
    Route::get('/chat/unread/{professorId}', [ChatController::class, 'getUnreadCount']);

    // Départements
    Route::apiResource('departments', DepartmentController::class);

    // Professeurs
    Route::apiResource('professors', ProfessorController::class);
    Route::get('professors/{id}/students', [ProfessorController::class, 'getStudents']);
    Route::post('professors/{id}/students', [ProfessorController::class, 'addStudent']);
    Route::delete('professors/{professorId}/students/{studentId}', [ProfessorController::class, 'removeStudent']);
    Route::get('professors/available-students', [ProfessorController::class, 'getAvailableStudents']);
    Route::post('professors/{professorId}/subjects/{subjectId}/roles', [ProfessorController::class, 'assignRole']);
    Route::delete('professors/{professorId}/subjects/{subjectId}/roles', [ProfessorController::class, 'removeRole']);

    // Étudiants
    Route::apiResource('students', StudentController::class);
    Route::get('students/{id}/supervisor', [StudentController::class, 'getSupervisor']);

    // Sujets
    Route::apiResource('subjects', SubjectController::class);
    Route::get('subjects/approved', [SubjectController::class, 'getApprovedSubjects']);
    Route::post('subjects/{id}/status', [SubjectController::class, 'updateStatus']);
    Route::put('subjects/{id}/status', [SubjectController::class, 'updateStatus']);
    Route::post('subjects/{id}/roles', [SubjectController::class, 'assignRoles']);

    // Rôles des professeurs sur les sujets
    Route::get('subjects/{subject}/roles', [ProfessorRoleController::class, 'index']);
    Route::post('subjects/{subject}/roles', [ProfessorRoleController::class, 'store']);
    Route::delete('subjects/{subject}/roles/{professor}', [ProfessorRoleController::class, 'destroy']);
});
