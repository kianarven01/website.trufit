<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user || !$user->employee || !$user->employee->role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. No role assigned.',
            ], 403);
        }

        $userPermissions = $user->employee->role->permissions ?? [];

        if (in_array('system.manage_roles', $userPermissions)) {
            return $next($request);
        }

        if (!in_array($permission, $userPermissions)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
