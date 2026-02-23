<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        // ...
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*', // Disable CSRF for API routes so React can post
        ]);
        
        // OR define your stateful domains for Sanctum
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
