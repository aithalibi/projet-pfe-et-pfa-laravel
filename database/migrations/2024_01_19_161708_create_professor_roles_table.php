<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professor_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('professor_id')->constrained()->onDelete('cascade');
            $table->enum('role_type', ['encadrant', 'rapporteur', 'president']);
            $table->timestamps();

            // Un professeur ne peut avoir qu'un seul type de rôle par sujet
            $table->unique(['subject_id', 'professor_id', 'role_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professor_roles');
    }
};
