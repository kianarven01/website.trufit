<?php

namespace App\Domains\Vehicle\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Domains\Vehicle\Application\Services\ManufacturerService;

class ManufacturerController extends Controller
{
    public function __construct(
        private ManufacturerService $manufacturerService
    ) {}

    public function index()
    {
        return response()->json(
            $this->manufacturerService->getAll()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $manufacturer = $this->manufacturerService->create($validated);

        return response()->json($manufacturer, 201);
    }
}