<?php

use Illuminate\Support\Facades\Route;

// Route catch-all pour le frontend, mais exclure les routes API
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
