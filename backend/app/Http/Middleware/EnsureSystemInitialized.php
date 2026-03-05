<?php

namespace App\Http\Middleware;

use Closure;
use App\System\SystemState;

class EnsureSystemInitialized
{
    public function handle($request, Closure $next)
    {
        if (!SystemState::initialized()) {
            return response()->json([
                'message' => 'System not initialized.'
            ], 503);
        }

        return $next($request);
    }
}