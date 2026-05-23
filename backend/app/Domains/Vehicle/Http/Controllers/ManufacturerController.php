<?php

namespace App\Domains\Vehicle\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Domains\Vehicle\Application\Services\ManufacturerService;

class ManufacturerController extends Controller
{
    public function __construct(
        private ManufacturerService $manufacturerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $type = $request->query('type');

        return response()->json([
            'data' => $this->manufacturerService->getAll($type),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:vehicle,parts'],
        ]);

        $manufacturer = $this->manufacturerService->create($validated);

        return response()->json([
            'message' => 'Manufacturer created successfully.',
            'data' => $manufacturer,
        ], 201);
    }
}