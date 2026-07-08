<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\VehicleModel;
use App\Domains\Product\Domain\Models\ServiceType;
use App\Domains\Product\Domain\Models\ServicePricing;
use App\Domains\Product\Domain\Models\ServiceCategory;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalentGroup;
use App\Domains\Product\Domain\Models\ProductEquivalentGroupItem;
use App\Domains\Product\Domain\Models\VehicleVariant;
use App\Domains\Product\Application\DTO\ArchiveCategoryDTO;
use App\Domains\Product\Application\UseCases\ArchiveCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;


class ProductReferenceController extends Controller
{
    // New method to retrieve all product categories for product association
    public function categories(): JsonResponse
    {
        $categories = Category::query()
            ->select('id', 'name', 'is_active', 'is_spol')
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                $category->parts_count = Part::query()
                    ->where('category_id', $category->id)
                    ->count();

                return $category;
            });

        return response()->json([
            'data' => $categories,
        ]);
    }

    // New method to retrieve all service categories for product association
    public function serviceCategories(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    // Create with auto-generated code if not provided, and ensure code uniqueness to prevent conflicts
    public function storeServiceCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique(ServiceCategory::class, 'name')],
        ]);

        $category = ServiceCategory::create($validated);

        return response()->json([
            'message' => 'Service category created successfully.',
            'data' => $category,
        ], 201);
    }

    // Update with option to change name, but if not provided, keep existing name to avoid breaking references
    public function updateServiceCategory(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique(ServiceCategory::class, 'name')->ignore($id)],
        ]);

        $category = ServiceCategory::findOrFail($id);
        $category->update($validated);

        return response()->json([
            'message' => 'Service category updated successfully.',
            'data' => $category,
        ]);
    }

    // Soft delete to preserve historical data integrity, and clear redundant string category column for associated services to prevent orphaned references
    public function deleteServiceCategory($id): JsonResponse
    {
        $category = ServiceCategory::findOrFail($id);
        
        // Clear the redundant string category column for associated services
        ServiceType::where('service_category_id', $id)->update(['category' => '']);

        $category->delete();

        return response()->json([
            'message' => 'Service category deleted successfully.',
        ]);
    }

    // Create with auto-generated code if not provided, and ensure code uniqueness to prevent conflicts
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_spol' => ['nullable', 'boolean'],
        ]);

        $name = trim($validated['name']);

        $existing = Category::query()
            ->where('is_active', true)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Category already exists.',
                'data' => $existing,
            ], 409);
        }

        $category = Category::create([
            'name' => $name,
            'is_active' => true,
            'is_spol' => $validated['is_spol'] ?? false,
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    // Update with option to change code, but if not provided, keep existing code to avoid breaking references
    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_spol' => ['nullable', 'boolean'],
        ]);

        $category = Category::query()->where('id', $id)->firstOrFail();

        if ($category->isSystem() && strtolower(trim($validated['name'])) !== strtolower($category->name)) {
            return response()->json([
                'message' => 'The Sundries category cannot be renamed.',
            ], 403);
        }

        $name = trim($validated['name']);

        $duplicate = Category::query()
            ->where('id', '!=', $category->id)
            ->where('is_active', true)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Another category with the same name already exists.',
            ], 409);
        }

        $updateData = [
            'name' => $name,
        ];

        if (array_key_exists('is_spol', $validated) && !$category->isSystem()) {
            $updateData['is_spol'] = $validated['is_spol'];
        }

        $category->update($updateData);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category,
        ]);
    }

    // Archive category, keep history, and unassign affected products/parts
    public function deleteCategory(string $id, ArchiveCategory $archiveCategory): JsonResponse
    {
        $result = $archiveCategory->execute(
            ArchiveCategoryDTO::fromId($id)
        );

        return response()->json([
            'message' => 'Category archived successfully. Affected products and parts were unassigned.',
            'data' => $result,
        ]);
    }

    // New method to retrieve all units of measurement for products
    public function units(): JsonResponse
    {
        $units = Unit::query()
            ->select('id', 'name', 'abbreviation')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    // New method to create units of measurement for products
    public function storeUnit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
        ]);

        $unit = Unit::query()
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($unit) {
            return response()->json([
                'message' => 'Unit already exists.',
                'data' => $unit,
            ], 409);
        }

        $unit = Unit::create([
            'name' => trim($validated['name']),
            'abbreviation' => isset($validated['abbreviation'])
                ? trim($validated['abbreviation'])
                : null,
        ]);

        return response()->json([
            'message' => 'Unit created successfully.',
            'data' => $unit,
        ], 201);
    }

    public function updateUnit(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
        ]);

        $unit = Unit::findOrFail($id);

        $duplicate = Unit::query()
            ->where('id', '!=', $id)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Another unit with the same name already exists.',
            ], 409);
        }

        $unit->update([
            'name' => trim($validated['name']),
            'abbreviation' => $validated['abbreviation'] ?? $unit->abbreviation,
        ]);

        return response()->json([
            'message' => 'Unit updated successfully.',
            'data' => $unit,
        ]);
    }

    public function deleteUnit(int $id): JsonResponse
    {
        $unit = Unit::findOrFail($id);

        $hasProducts = Product::where('unit', $id)->exists();
        if ($hasProducts) {
            return response()->json([
                'message' => 'Cannot delete unit. It is assigned to existing products.',
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'message' => 'Unit deleted successfully.',
        ]);
    }

    // New method to create units of measurement for products
    public function manufacturers(): JsonResponse
    {
        $manufacturers = Manufacturers::query()
            ->select('id', 'name', 'type', 'code')
            ->where('type', 'Part')
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(function ($manufacturer) {
                $manufacturer->parts_count = Part::query()
                    ->whereHas('products', fn($q) => $q->where('manufacturer_id', $manufacturer->id))
                    ->count();

                return $manufacturer;
            });

        return response()->json([
            'data' => $manufacturers,
        ]);
    }

    // New method to create manufacturers for products with type 'Part'
    public function storeManufacturer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $manufacturer = Manufacturers::query()
            ->where('type', 'Part')
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($manufacturer) {
            return response()->json([
                'message' => 'Manufacturer already exists.',
                'data' => $manufacturer,
            ], 409);
        }

        $manufacturer = Manufacturers::create([
            'name' => trim($validated['name']),
            'type' => 'Part',
            'code' => !empty($validated['code'])
                ? strtoupper(trim($validated['code']))
                : $this->generateReferenceCode($validated['name']),
        ]);

        return response()->json([
            'message' => 'Manufacturer created successfully.',
            'data' => $manufacturer,
        ], 201);
    }

    public function updateManufacturer(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $manufacturer = Manufacturers::findOrFail($id);

        $duplicate = Manufacturers::query()
            ->where('id', '!=', $id)
            ->where('type', 'Part')
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Another manufacturer with the same name already exists.',
            ], 409);
        }

        $manufacturer->update([
            'name' => trim($validated['name']),
            'code' => !empty($validated['code'])
                ? strtoupper(trim($validated['code']))
                : $manufacturer->code,
        ]);

        return response()->json([
            'message' => 'Manufacturer updated successfully.',
            'data' => $manufacturer,
        ]);
    }

    public function deleteManufacturer(int $id): JsonResponse
    {
        $manufacturer = Manufacturers::findOrFail($id);

        $hasProducts = Product::where('manufacturer_id', $id)->exists();
        if ($hasProducts) {
            return response()->json([
                'message' => 'Cannot delete manufacturer. It is assigned to existing products.',
            ], 422);
        }

        $manufacturer->delete();

        return response()->json([
            'message' => 'Manufacturer deleted successfully.',
        ]);
    }

    // New method to generate unique reference code based on name, with fallback to random string to ensure uniqueness
    public function storePart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $category = Category::query()
            ->where('id', $validated['category_id'])
            ->firstOrFail();

        $part = Part::query()
            ->where('category_id', $category->id)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($part) {
            return response()->json([
                'message' => 'Part already exists in this category.',
                'data' => $part->load('category'),
            ], 409);
        }

        $part = Part::create([
            'name' => trim($validated['name']),
            'category_id' => $category->id,
            'code' => !empty($validated['code'])
                ? strtoupper(trim($validated['code']))
                : $this->generateReferenceCode($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Part created successfully.',
            'data' => [
                'id' => $part->id,
                'name' => $part->name,
                'description' => $part->description,
                'category_id' => $part->category_id,
                'category_name' => $category->name,
                'code' => $part->code,
            ],
        ], 201);
    }

    public function updatePart(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $part = Part::findOrFail($id);

        $category = Category::query()
            ->where('id', $validated['category_id'])
            ->firstOrFail();

        $duplicate = Part::query()
            ->where('id', '!=', $id)
            ->where('category_id', $category->id)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Another part with the same name exists in this category.',
            ], 409);
        }

        $part->update([
            'name' => trim($validated['name']),
            'category_id' => $category->id,
            'code' => !empty($validated['code'])
                ? strtoupper(trim($validated['code']))
                : $part->code,
            'description' => $validated['description'] ?? $part->description,
        ]);

        return response()->json([
            'message' => 'Part updated successfully.',
            'data' => [
                'id' => $part->id,
                'name' => $part->name,
                'description' => $part->description,
                'category_id' => $part->category_id,
                'category_name' => $category->name,
                'code' => $part->code,
            ],
        ]);
    }

    public function deletePart(int $id): JsonResponse
    {
        $part = Part::findOrFail($id);

        $hasProducts = Product::where('part_id', $id)->exists();
        if ($hasProducts) {
            return response()->json([
                'message' => 'Cannot delete part. It is assigned to existing products.',
            ], 422);
        }

        // Delete equivalent group items and groups that reference this part
        $groupIds = ProductEquivalentGroup::where('part_id', $id)->pluck('id');
        if ($groupIds->isNotEmpty()) {
            ProductEquivalentGroupItem::whereIn('group_id', $groupIds)->delete();
            ProductEquivalentGroup::whereIn('id', $groupIds)->delete();
        }

        $part->delete();

        return response()->json([
            'message' => 'Part deleted successfully.',
        ]);
    }

    // New method to retrieve all vehicles (vehicle models with manufacturer and variants) for product association
    public function vehicles(): JsonResponse
    {
        $vehicles = VehicleModel::with(['manufacturer', 'variants'])->get();

        return response()->json([
            'data' => $vehicles,
        ]);
    }

    // New method to handle custom vehicle creation with dynamic manufacturer and model handling
    public function storeCustomVehicle(Request $request)
    {
        $request->validate([
            'make' => 'required|string',
            'model' => 'required|string',
        ]);

        // Find or create Manufacturer
        $manufacturer = Manufacturers::firstOrCreate(
            ['name' => $request->make, 'type' => 'Vehicle']
        );

        // Find or create VehicleModel
        $vehicleModel = VehicleModel::firstOrCreate(
            ['model' => $request->model, 'manufacturer_id' => $manufacturer->id]
        );

        return response()->json([
            'message' => 'Vehicle added successfully',
            'data' => [
                'id' => $vehicleModel->id,
                'make' => $manufacturer->name,
                'model' => $vehicleModel->model,
            ]
        ]);
    }

    // New method to retrieve all service types with their pricings and categories
    public function serviceTypes()
    {
        $services = ServiceType::with(['serviceCategory', 'pricings'])->get();
        return response()->json([
            'data' => $services,
        ]);
    }

    // New method to retrieve a single service type with its pricings and category
    public function showServiceType($id)
    {
        $service = ServiceType::with(['pricings', 'serviceCategory'])->find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        return response()->json(['data' => $service]);
    }

    // Create with option to assign existing category or create new one on the fly, and handle associated pricings
    public function storeServiceType(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'category_name' => 'nullable|string',
            'service_category_id' => ['nullable', Rule::exists(ServiceCategory::class, 'id')],
            'tasks' => 'nullable|array',
            'duration' => 'nullable|integer',
            'pricing_type' => 'nullable|string',
            'price' => 'nullable|numeric',
            'pricing' => 'nullable|array'
        ]);

        if (!isset($data['service_category_id']) && isset($data['category_name'])) {
            $cat = ServiceCategory::firstOrCreate(['name' => ucfirst($data['category_name'])]);
            $data['service_category_id'] = $cat->id;
        }

        $service = ServiceType::create([
            'name' => ucfirst($data['name']),
            'category' => $data['category_name'] ?? '',
            'service_category_id' => $data['service_category_id'] ?? null,
            'tasks' => $data['tasks'] ?? [],
            'duration' => $data['duration'] ?? 0,
            'pricing_type' => $data['pricing_type'] ?? 'fixed',
            'price' => $data['price'] ?? 0
        ]);

        if (isset($data['pricing']) && is_array($data['pricing'])) {
            foreach ($data['pricing'] as $p) {
                ServicePricing::create([
                    'service_type_id' => $service->id,
                    'vehicle_size_name' => $p['vehicle_size_name'] ?? ($p['vehicle_size_id'] ?? 'Default'),
                    'vehicle_types' => $p['vehicle_types'] ?? [],
                    'price' => $p['price'] ?? 0,
                    'pricing_type' => $p['pricing_type'] ?? $service->pricing_type
                ]);
            }
        }

        return response()->json([
            'message' => 'Service created successfully',
            'data' => $service->load('pricings')
        ]);
    }

    // Update with option to change category and handle associated pricings
    public function updateServiceType(Request $request, $id)
    {
        $service = ServiceType::find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string',
            'category_name' => 'nullable|string',
            'service_category_id' => ['nullable', Rule::exists(ServiceCategory::class, 'id')],
            'tasks' => 'nullable|array',
            'duration' => 'nullable|integer',
            'pricing_type' => 'nullable|string',
            'price' => 'nullable|numeric',
            'pricing' => 'nullable|array'
        ]);

        if (!isset($data['service_category_id']) && isset($data['category_name'])) {
            $cat = ServiceCategory::firstOrCreate(['name' => ucfirst($data['category_name'])]);
            $data['service_category_id'] = $cat->id;
        }

        $service->update([
            'name' => ucfirst($data['name']),
            'category' => $data['category_name'] ?? $service->category,
            'service_category_id' => $data['service_category_id'] ?? $service->service_category_id,
            'tasks' => $data['tasks'] ?? $service->tasks,
            'duration' => $data['duration'] ?? $service->duration,
            'pricing_type' => $data['pricing_type'] ?? $service->pricing_type,
            'price' => $data['price'] ?? $service->price
        ]);

        if (isset($data['pricing']) && is_array($data['pricing'])) {
            $service->pricings()->delete();
            foreach ($data['pricing'] as $p) {
                ServicePricing::create([
                    'service_type_id' => $service->id,
                    'vehicle_size_name' => $p['vehicle_size_name'] ?? ($p['vehicle_size_id'] ?? 'Default'),
                    'vehicle_types' => $p['vehicle_types'] ?? [],
                    'price' => $p['price'] ?? 0,
                    'pricing_type' => $p['pricing_type'] ?? $service->pricing_type
                ]);
            }
        }

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $service->load('pricings')
        ]);
    }

    // Soft delete to preserve historical data integrity
    public function destroyServiceType($id)
    {
        $service = ServiceType::find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        $service->delete();
        return response()->json(['message' => 'Service deleted successfully']);
    }

    // Helper method to generate a reference code based on the name, ensuring it is unique and consistent
    private function generateReferenceCode(string $name): string
    {
        $words = preg_split('/[\s\-_]+/', strtoupper(trim($name)));

        if (!$words || count($words) === 0) {
            return 'GEN';
        }

        if (count($words) === 1) {
            return substr(preg_replace('/[^A-Z0-9]/', '', $words[0]), 0, 3) ?: 'GEN';
        }

        $code = collect($words)
            ->filter()
            ->map(fn ($word) => substr(preg_replace('/[^A-Z0-9]/', '', $word), 0, 1))
            ->join('');

        return $code ?: 'GEN';
    }
}