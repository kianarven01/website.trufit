<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $employee = $user->employee;

        if (!$employee || !$employee->role) {
            return response()->json(['status' => 'error', 'message' => 'No role assigned'], 403);
        }

        $role = $employee->role;

        // Admin role has all permissions
        if (strtolower($role->name) === 'admin') {
            return $next($request);
        }

        $userPermissions = $role->permissions ?? [];

        // Check if user has ANY of the required permissions (OR logic)
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                return $next($request);
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Insufficient permissions. Required: ' . implode(' or ', $permissions),
        ], 403);
    }
}
