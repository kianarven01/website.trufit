<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Employee;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = DB::table('Main.Employees')
            ->join('Main.Roles', 'Main.Employees.roleID', '=', 'Main.Roles.id')
            ->select('Main.Employees.*', 'Main.Roles.name as role_name')
            ->get();

        return response()->json(['status' => 'success', 'data' => $employees]);
    }

    // EmployeeController.php

    public function onboard(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'role_id' => 'required|integer'
        ]);

        // We use DB::raw to target the table without letting Laravel's 
        // "detective" logic try to parse the dot as a connection.
        return DB::connection('pgsql')->transaction(function () use ($validated) {

            // 1. Combine first and last name to match your "name" column
            $fullName = $validated['first_name'] . ' ' . $validated['last_name'];

            // 2. Insert into Employees (using exact column names from your CREATE script)
            $employeeId = DB::table(DB::raw('"Main"."Employees"'))->insertGetId([
                'name'     => $fullName,
                'email'    => $validated['email'],
                'position' => 'Staff',        // Required 'NOT NULL' in your SQL
                'roleID'   => $validated['role_id'],
                'status'   => false,          // Boolean in your SQL
            ]);

            $keyCode = strtoupper(bin2hex(random_bytes(4)));

            // 3. Insert into RegistrationKeys
            DB::table(DB::raw('"Main"."RegistrationKeys"'))->insert([
                'key_code'    => $keyCode,
                'role_id'     => $validated['role_id'],
                'employee_id' => $employeeId,
                'is_used'     => false,
                'created_at'  => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'key'    => $keyCode
            ]);
        });
    }
}
