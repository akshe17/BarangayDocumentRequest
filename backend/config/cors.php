<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

   'allowed_origins' => [
    'http://localhost:5173',   // Your React Web port
    'http://192.168.0.103:8000', // Your local IP
    '*', // Or just use this wildcard during development to stop all errors
],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];