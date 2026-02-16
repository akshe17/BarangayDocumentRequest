<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Exclude API routes from CSRF protection
        $middleware->statefulApi();
        $middleware->alias([
        'custom.auth' => \App\Http\Middleware\CustomTokenAuth::class,
        'verified.resident' => \App\Http\Middleware\ResidentVerified::class, // ADD THIS
    ]);
    $middleware->validateCsrfTokens(except: [
        'api/*',
    ]);
  
        // Add CORS middleware to API routes
           $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();