<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:Main.Roles,name',
            'permissions' => 'required|array'
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'permissions' => $validated['permissions'] // Laravel handles array to JSONB
        ]);

        return response()->json(['status' => 'success', 'data' => $role]);
    }
}
