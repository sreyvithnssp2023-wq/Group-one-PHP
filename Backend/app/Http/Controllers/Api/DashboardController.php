<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $timezone = 'Asia/Phnom_Penh';
            $now = Carbon::now($timezone);

            // 1. ទាញ Sales និង Products
            $allSales = Sale::all();
            $totalProducts = (int) Product::count();

            $totalRevenue = (float) round($allSales->sum('total_amount'), 2);
            $totalCustomers = (int) $allSales->pluck('customer_name')->filter(function ($n) {
                return !empty(trim($n));
            })->unique()->count();

            // 2. Today's Sales
            $todayStr = $now->format('Y-m-d');
            $todaySales = $allSales->filter(function ($sale) use ($todayStr) {
                $rawDate = $sale->created_at ?? $sale->sale_date ?? null;
                return $rawDate && str_contains((string)$rawDate, $todayStr);
            });

            $todaysOrders  = $todaySales->count() > 0 ? $todaySales->count() : $allSales->count();
            $todaysRevenue = $todaySales->sum('total_amount') > 0 ? (float)round($todaySales->sum('total_amount'), 2) : $totalRevenue;

            // Helper Carbon Parse
            $getSaleCarbon = function ($sale) use ($timezone) {
                $raw = $sale->created_at ?? $sale->sale_date ?? $sale->updated_at ?? null;
                if (empty($raw)) return null;
                try {
                    return Carbon::parse($raw)->setTimezone($timezone);
                } catch (\Exception $e) {
                    return null;
                }
            };

            // 📊 3. Daily Chart (Mon - Sun)
            $daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            $dayGrouped = array_fill_keys($daysName, 0.0);

            foreach ($allSales as $sale) {
                $c = $getSaleCarbon($sale);
                if ($c) {
                    $dayName = $c->format('D');
                    if (isset($dayGrouped[$dayName])) {
                        $dayGrouped[$dayName] += (float) ($sale->total_amount ?? 0);
                    }
                }
            }

            $chartData = [];
            foreach ($daysName as $day) {
                $chartData[] = [
                    'day'     => $day,
                    'date'    => $day,
                    'revenue' => (float) round($dayGrouped[$day], 2)
                ];
            }

            // 📊 4. Weekly Chart
            $wGrouped = [1 => 0.0, 2 => 0.0, 3 => 0.0, 4 => 0.0];
            foreach ($allSales as $sale) {
                $c = $getSaleCarbon($sale);
                if ($c) {
                    $wNum = min(4, max(1, (int) ceil($c->day / 7)));
                    $wGrouped[$wNum] += (float) ($sale->total_amount ?? 0);
                }
            }
            $weeklyChartData = [];
            for ($w = 1; $w <= 4; $w++) {
                $weeklyChartData[] = [
                    'date'    => "Week $w",
                    'revenue' => (float) round($wGrouped[$w], 2)
                ];
            }

            // 📊 5. Monthly Chart
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            $mGrouped = array_fill_keys($months, 0.0);
            foreach ($allSales as $sale) {
                $c = $getSaleCarbon($sale);
                if ($c) {
                    $mName = $c->format('M');
                    if (isset($mGrouped[$mName])) {
                        $mGrouped[$mName] += (float) ($sale->total_amount ?? 0);
                    }
                }
            }
            $monthlyChartData = [];
            foreach ($months as $m) {
                $monthlyChartData[] = [
                    'date'    => $m,
                    'revenue' => (float) round($mGrouped[$m], 2)
                ];
            }

            // 6. Recent Orders (តម្រៀបតាម sale_id ឬ id ឬ created_at ក្នុង Memory ដើម្បីការពារ SQL Column Missing Error)
            $recentOrders = $allSales->sortByDesc(function ($sale) {
                return $sale->sale_id ?? $sale->id ?? $sale->created_at ?? 0;
            })->take(10)->values();

            return response()->json([
                'todays_orders'      => $todaysOrders,
                'todays_revenue'     => $todaysRevenue,
                'total_products'     => $totalProducts,
                'total_customers'    => $totalCustomers,
                'total_revenue'      => $totalRevenue,
                'recent_orders'      => $recentOrders,
                'chart_data'         => $chartData,
                'weekly_chart_data'  => $weeklyChartData,
                'monthly_chart_data' => $monthlyChartData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => $e->getMessage(),
                'message' => 'Dashboard calculation error'
            ], 500);
        }
    }
}
