<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            Log::info('Tentative de connexion', [
                'email' => $request->email,
                'request' => $request->all()
            ]);

            // Valider les données
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required']
            ]);

            // Vérifier si l'utilisateur existe
            $user = User::where('email', $credentials['email'])->first();
            
            if (!$user) {
                Log::warning('Utilisateur non trouvé', ['email' => $credentials['email']]);
                return response()->json([
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // Vérifier le mot de passe
            if (!Hash::check($credentials['password'], $user->password)) {
                Log::warning('Mot de passe incorrect', ['email' => $credentials['email']]);
                return response()->json([
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // Authentifier l'utilisateur
            Auth::login($user);
            
            // Créer le token
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('Connexion réussie', [
                'user_id' => $user->id,
                'role' => $user->role
            ]);

            return response()->json([
                'token' => $token,
                'role' => $user->role,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'message' => 'Connexion réussie'
            ], 200);

        } catch (ValidationException $e) {
            Log::error('Erreur de validation', [
                'errors' => $e->errors(),
                'email' => $request->email
            ]);
            
            return response()->json([
                'message' => 'Données de connexion invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la connexion', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $request->email
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de la connexion',
                'debug_message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = Auth::user();
            if ($user) {
                $user->tokens()->delete();
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
            
            return response()->json([
                'message' => 'Déconnexion réussie'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la déconnexion', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de la déconnexion'
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des informations utilisateur', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue'
            ], 500);
        }
    }
}
