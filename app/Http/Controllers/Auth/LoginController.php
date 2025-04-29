<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            // Log des tentatives de connexion
            Log::info('Tentative de connexion', [
                'email' => $request->email,
                'ip' => $request->ip()
            ]);

            if (Auth::attempt($request->only('email', 'password'))) {
                $user = Auth::user();
                $token = $user->createToken('auth_token')->plainTextToken;
                
                Log::info('Connexion réussie', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);

                return response()->json([
                    'token' => $token,
                    'user' => $user,
                    'role' => $user->role ?? 'user',
                    'message' => 'Connexion réussie'
                ]);
            }

            Log::warning('Échec de connexion - Identifiants incorrects', [
                'email' => $request->email
            ]);

            return response()->json([
                'message' => 'Les identifiants fournis sont incorrects.',
                'errors' => [
                    'email' => ['Les identifiants fournis sont incorrects.']
                ]
            ], 401);

        } catch (ValidationException $e) {
            Log::error('Erreur de validation lors de la connexion', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur inattendue lors de la connexion', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la connexion.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
