<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: http://cors-errors.info
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',    // Frontend Vite
        'http://localhost:5174',    // Frontend Vite Alternative Port
        'http://localhost:5175',    // Frontend Vite Alternative Port
        'http://localhost:8000',    // Backend Laravel
        'http://127.0.0.1:5173',    // Alternative Frontend URL
        'http://127.0.0.1:5174',    // Alternative Frontend URL
        'http://127.0.0.1:5175',    // Alternative Frontend URL
        'http://127.0.0.1:8000',    // Alternative Backend URL
        'http://127.0.0.1:62778',   // Browser Preview Proxy
        '*'                         // Allow all origins temporarily for debugging
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
