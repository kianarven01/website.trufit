<?php

namespace App\Domains\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function salesSummary(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Only count PAID billing statements as revenue
        $totalSales = DB::table('BillingStatement')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('status', 'Paid')
            ->sum('Total');

        $totalOrders = DB::table('BillingStatement')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('status', 'Paid')
            ->count();

        // Paid = completed billing
        $completedOrders = DB::table('BillingStatement')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('status', 'Paid')
            ->count();

        // Unpaid or Partially Paid = pending
        $pendingOrders = DB::table('BillingStatement')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->whereIn('status', ['Unpaid', 'Partially Paid'])
            ->count();

        // Daily revenue - only from PAID billing
        $dailySales = DB::table('BillingStatement')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('status', 'Paid')
            ->select(
                DB::raw("DATE(\"Date\") as date"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM("Total") as revenue')
            )
            ->groupBy(DB::raw("DATE(\"Date\")"))
            ->orderBy('date')
            ->get();

        // Sales by type - only from PAID billing
        $salesByType = DB::table('BillingStatement')
            ->join('SalesOrder', 'BillingStatement.SOID', '=', 'SalesOrder.id')
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('BillingStatement.status', 'Paid')
            ->select('SalesOrder.type', DB::raw('COUNT(*) as count'), DB::raw('SUM("BillingStatement"."Total") as total'))
            ->groupBy('SalesOrder.type')
            ->get();

        // Get top items from BillingStatementItems with product details
        // For sundries (supply), use the item name directly since they're unique per sale
        // For parts/services, join Products to get manufacturer and part_number
        $topServices = DB::table('BillingStatementItems')
            ->join('BillingStatement', DB::raw('"BillingStatementItems"."BillingStatementID"'), '=', DB::raw('"BillingStatement"."id"'))
            ->leftJoin('Products', function ($join) {
                $join->on('BillingStatementItems.name', '=', 'Products.name')
                     ->where('BillingStatementItems.type', '!=', 'supply');
            })
            ->leftJoin('Manufacturers', function ($join) {
                $join->on('Products.manufacturer_id', '=', 'Manufacturers.id')
                     ->where('BillingStatementItems.type', '!=', 'supply');
            })
            ->whereBetween(DB::raw('"BillingStatement"."Date"'), [$start, $end])
            ->where('BillingStatement.status', 'Paid')
            ->select(
                DB::raw('CASE WHEN "BillingStatementItems"."type" = \'supply\' THEN "BillingStatementItems"."name" ELSE TRIM(COALESCE("Manufacturers"."name", \'\') || \' \' || COALESCE("Products"."part_number", \'\') || \' \' || "BillingStatementItems"."name") END as name'),
                'BillingStatementItems.type',
                DB::raw('CASE WHEN "BillingStatementItems"."type" = \'supply\' THEN NULL ELSE "Products"."part_number" END as part_number'),
                DB::raw('CASE WHEN "BillingStatementItems"."type" = \'supply\' THEN \'Sundries\' ELSE COALESCE("Manufacturers"."name", \'Unknown\') END as manufacturer'),
                DB::raw('SUM("BillingStatementItems"."quantity") as times_sold'),
                DB::raw('SUM("BillingStatementItems"."SubTotal") as total_revenue')
            )
            ->groupBy('BillingStatementItems.name', 'BillingStatementItems.type', 'Products.part_number', 'Manufacturers.name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_sales' => (float) $totalSales,
                    'total_orders' => $totalOrders,
                    'completed_orders' => $completedOrders,
                    'pending_orders' => $pendingOrders,
                    'average_order_value' => $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0,
                ],
                'sales_by_type' => $salesByType,
                'daily_sales' => $dailySales,
                'top_services' => $topServices,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
            ],
        ]);
    }

    public function inventoryReport(Request $request)
    {
        $lowStockThreshold = $request->input('threshold', 10);

        // Group inventory by product, excluding Sundries category
        // Format name as "Manufacturer PartNumber ProductName"
        $inventorySummary = DB::table('Inventory')
            ->join('Products', 'Inventory.productID', '=', 'Products.id')
            ->leftJoin('Category', 'Products.category_id', '=', 'Category.id')
            ->leftJoin('Manufacturers', 'Products.manufacturer_id', '=', 'Manufacturers.id')
            ->whereRaw('"Category"."name" IS NULL OR LOWER("Category"."name") != ?', ['sundries'])
            ->select(
                'Products.id as product_id',
                DB::raw('TRIM(COALESCE("Manufacturers"."name", \'\') || \' \' || COALESCE("Products"."part_number", \'\') || \' \' || "Products"."name") as product_name'),
                DB::raw('"Products"."SKU"'),
                DB::raw('"Products"."part_number"'),
                DB::raw('COALESCE("Manufacturers"."name", \'Unknown\') as manufacturer'),
                DB::raw('SUM("Inventory"."quantity_on_hand") as total_on_hand'),
                DB::raw('SUM("Inventory"."reserved_quantity") as total_reserved'),
                DB::raw('SUM("Inventory"."quantity_on_hand") - SUM("Inventory"."reserved_quantity") as available'),
                DB::raw('MAX("Inventory"."reorder_level") as reorder_level')
            )
            ->groupBy(DB::raw('"Products"."id"'), DB::raw('"Products"."name"'), DB::raw('"Products"."SKU"'), DB::raw('"Products"."part_number"'), DB::raw('"Manufacturers"."name"'))
            ->get();

        $totalProducts = $inventorySummary->count();

        $inStock = $inventorySummary->filter(fn($item) => $item->available > max($item->reorder_level, 0))->count();

        $lowStock = $inventorySummary->filter(function ($item) use ($lowStockThreshold) {
            $threshold = $item->reorder_level > 0 ? $item->reorder_level : $lowStockThreshold;
            return $item->available > 0 && $item->available <= $threshold;
        })->count();

        $outOfStock = $inventorySummary->filter(fn($item) => $item->available <= 0)->count();

        $lowStockItems = $inventorySummary->filter(function ($item) use ($lowStockThreshold) {
            $threshold = $item->reorder_level > 0 ? $item->reorder_level : $lowStockThreshold;
            return $item->available > 0 && $item->available <= $threshold;
        })->values();

        // Total inventory value excluding Sundries
        // Price comes from ProductPrice via preferred supplier, fallback to Inventory.sell_price
        $totalInventoryValue = DB::select('
            SELECT COALESCE(SUM(i."quantity_on_hand" * COALESCE(pp."Price", i."sell_price", 0)), 0) as total_value
            FROM "Inventory" i
            JOIN "Products" p ON i."productID" = p.id
            LEFT JOIN "Category" c ON p."category_id" = c.id
            LEFT JOIN "ProductSuppliers" ps ON ps."product_id" = p.id AND ps.id = p."preferred_supplier_id"
            LEFT JOIN "ProductPrice" pp ON pp."product_supplier_id" = ps.id
            WHERE c.name IS NULL OR LOWER(c.name) != ?
        ', ['sundries']);

        $stockValue = is_array($totalInventoryValue) && count($totalInventoryValue) > 0
            ? (float) $totalInventoryValue[0]->total_value
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_products' => $totalProducts,
                    'in_stock' => $inStock,
                    'low_stock' => $lowStock,
                    'out_of_stock' => $outOfStock,
                    'total_inventory_value' => $stockValue,
                ],
                'low_stock_items' => $lowStockItems,
                'inventory_details' => $inventorySummary,
            ],
        ]);
    }

    public function financialReport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $totalRevenue = DB::table('BillingStatement')
            ->whereBetween('Date', [$start, $end])
            ->where('status', '!=', 'VOID')
            ->sum('Total');

        $totalPaid = DB::table('Payment')
            ->whereBetween('Date', [$start, $end])
            ->sum('Amount');

        $outstandingBalance = DB::table('BillingStatement')
            ->whereBetween('Date', [$start, $end])
            ->where('status', '!=', 'VOID')
            ->selectRaw('"Total" - COALESCE((SELECT SUM("Amount") FROM "Payment" WHERE "Payment"."BillingID" = "BillingStatement"."id"), 0) as balance')
            ->havingRaw('"Total" - COALESCE((SELECT SUM("Amount") FROM "Payment" WHERE "Payment"."BillingID" = "BillingStatement"."id"), 0) > 0')
            ->sum('balance');

        $paymentsByMethod = DB::table('Payment')
            ->whereBetween('Date', [$start, $end])
            ->select('PaymentMethod', DB::raw('COUNT(*) as count'), DB::raw('SUM("Amount") as total'))
            ->groupBy('PaymentMethod')
            ->get();

        $dailyRevenue = DB::table('Payment')
            ->whereBetween('Date', [$start, $end])
            ->select(
                DB::raw("DATE(\"Date\") as date"),
                DB::raw('COUNT(*) as transactions'),
                DB::raw('SUM("Amount") as amount')
            )
            ->groupBy(DB::raw("DATE(\"Date\")"))
            ->orderBy('date')
            ->get();

        $billsByStatus = DB::table('BillingStatement')
            ->whereBetween('Date', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM("Total") as total'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_paid' => (float) $totalPaid,
                    'outstanding_balance' => (float) $outstandingBalance,
                    'collection_rate' => $totalRevenue > 0 ? round(($totalPaid / $totalRevenue) * 100, 1) : 0,
                ],
                'payments_by_method' => $paymentsByMethod,
                'daily_revenue' => $dailyRevenue,
                'bills_by_status' => $billsByStatus,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
            ],
        ]);
    }
}
