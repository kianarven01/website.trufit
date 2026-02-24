<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{

    public function handle($request, Closure $next, $module, $action)
    {
        $user = Auth::user();

        // Ensure the user, employee, and role exist
        $permissions = $user->employee->role->permissions ?? [];

        // Check if the module exists in JSON and if the action is allowed
        if (isset($permissions[$module]) && in_array($action, $permissions[$module])) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized action.'], 403);
    }
}
