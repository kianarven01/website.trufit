<?php

namespace App\Domains\Customer\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Domains\Customer\Domain\Models\AppointmentNote;
use Illuminate\Support\Facades\Auth;

class AppointmentNoteController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $note = AppointmentNote::where('user_id', Auth::id())
            ->where('key', $request->key)
            ->first();

        return response()->json([
            'data' => $note ? $note->data : []
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'data' => 'present|array',
        ]);

        if (empty($request->data)) {
            AppointmentNote::where('user_id', Auth::id())
                ->where('key', $request->key)
                ->delete();
            
            return response()->json([
                'message' => 'Notes cleared successfully',
                'data' => []
            ]);
        }

        $note = AppointmentNote::updateOrCreate(
            ['user_id' => Auth::id(), 'key' => $request->key],
            ['data' => $request->data]
        );

        return response()->json([
            'message' => 'Notes saved successfully',
            'data' => $note->data
        ]);
    }
}
