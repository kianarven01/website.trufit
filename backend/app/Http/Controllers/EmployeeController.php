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
        // Changing this to a regular join filters out anyone without a UserCredentials record
        $employees = DB::table('Main.Employees')
            ->join('Main.Roles', 'Main.Employees.roleID', '=', 'Main.Roles.id')
            ->join('Main.UserCredentials', 'Main.Employees.id', '=', 'Main.UserCredentials.employeeID')
            ->select(
                'Main.Employees.*',
                'Main.Roles.name as role_name'
            )
            ->get();

        return response()->json(['status' => 'success', 'data' => $employees]);
    }


    // Updated onboard function in EmployeeController.php
    public function onboard(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email|unique:pgsql.Main.Employees,email',
            'role_id'    => 'required|integer',
            'position'   => 'required|string', // Fixed: Added missing comma
            'phone'      => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $fullName = $validated['first_name'] . ' ' . $validated['last_name'];

            $employeeId = DB::table('Main.Employees')->insertGetId([
                'name'     => $fullName,
                'email'    => $validated['email'],
                'position' => $validated['position'],
                'roleID'   => $validated['role_id'],
                'phone'    => $validated['phone'], // Added: Now correctly inserts phone to DB
                'status'   => false,
            ]);

            $keyCode = strtoupper(bin2hex(random_bytes(4)));

            DB::table('Main.RegistrationKeys')->insert([
                'key_code'    => $keyCode,
                'role_id'     => $validated['role_id'],
                'employee_id' => $employeeId,
                'is_used'     => false,
                'created_at'  => now(),
                'expires_at'  => now()->addHours(24),
            ]);

            return response()->json(['status' => 'success', 'key' => $keyCode]);
        });
    }
    public function getRegistrationKeys()
    {
        // Fetch keys and join with Employee to show names in the table
        $keys = DB::table('Main.RegistrationKeys')
            ->join('Main.Employees', 'Main.RegistrationKeys.employee_id', '=', 'Main.Employees.id')
            ->select(
                'Main.RegistrationKeys.*',
                'Main.Employees.name as employee_name',
                'Main.Employees.email'
            )
            ->orderBy('Main.RegistrationKeys.created_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $keys]);
    }
}
