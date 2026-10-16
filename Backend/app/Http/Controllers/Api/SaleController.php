<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SaleController extends Controller
{
    /**
     * ១. ទាញយកប្រវត្តិលក់ទាំងអស់
     */
    public function index()
    {
        try {
            $sales = Sale::with(['details.product', 'payments'])
                ->orderBy('sale_id', 'desc')
                ->get();

            return response()->json($sales, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'មិនអាចទាញយកទិន្នន័យបានទេ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ២. មុខងារ Checkout គិតលុយ និងកាត់ស្តុក
     */
    public function store(Request $request)
    {
        $request->validate([
            'total_amount' => 'required|numeric',
            'items'        => 'required|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            // ១. ផ្ទៀងផ្ទាត់ស្តុកទំនិញ
            foreach ($request->items as $item) {
                $productId = $item['product_id'] ?? $item['id'] ?? null;
                $qty       = $item['quantity'] ?? $item['qty'] ?? 1;

                $product = Product::find($productId);

                if (!$product) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "រកមិនឃើញទំនិញ ID: {$productId} ក្នុងប្រព័ន្ធទេ!"
                    ], 400);
                }

                if ($product->stock_qty < $qty) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "ទំនិញ '{$product->product_name}' មិនមានស្តុកគ្រប់គ្រាន់ទេ! (សល់ត្រឹមតែ {$product->stock_qty})"
                    ], 400);
                }
            }

            // ២. បង្កើតកំណត់ត្រាលក់ (Sale)
            $saleData = [
                'sale_date'      => now(),
                'total_amount'   => $request->total_amount,
                'discount'       => $request->discount ?? 0,
                'payment_status' => $request->payment_status ?? 'Paid',
            ];

            if ($request->has('customer_id')) {
                $saleData['customer_id'] = $request->customer_id;
            }
            if ($request->has('user_id')) {
                $saleData['user_id'] = $request->user_id;
            }
            if ($request->has('customer_name')) {
                $saleData['customer_name'] = $request->customer_name;
            }

            $sale = Sale::create($saleData);
            $saleId = $sale->sale_id ?? $sale->id;

            // ៣. បង្កើតប្រវត្តិបង់ប្រាក់ (Payment)
            Payment::create([
                'sale_id'        => $saleId,
                'payment_method' => $request->payment_method ?? 'Cash',
                'amount'         => $request->total_amount,
                'payment_date'   => now(),
            ]);

            // ៤. បញ្ចូល Sale Details និងកាត់ស្តុកទំនិញ
            foreach ($request->items as $item) {
                $productId = $item['product_id'] ?? $item['id'];
                $qty       = $item['quantity'] ?? $item['qty'] ?? 1;
                $price     = $item['unit_price'] ?? $item['price'] ?? 0;

                SaleDetail::create([
                    'sale_id'    => $saleId,
                    'product_id' => $productId,
                    'quantity'   => $qty,
                    'unit_price' => $price,
                ]);

                $product = Product::find($productId);
                if ($product) {
                    $product->decrement('stock_qty', $qty);
                }
            }

            DB::commit();

            $sale->load(['details.product', 'payments']);

            return response()->json([
                'message' => 'ការទូទាត់ប្រាក់ជោគជ័យ!',
                'data'    => $sale
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'ការទូទាត់បរាជ័យ៖ ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ៣. មើលព័ត៌មានលក់តាម ID
     */
    public function show($id)
    {
        $sale = Sale::with(['details.product', 'payments'])->find($id);

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale, 200);
    }

    /**
     * ៤. លុបប្រវត្តិលក់ និងបង្វិលស្តុក
     */
    public function destroy($id)
    {
        $sale = Sale::with('details')->find($id);

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        DB::beginTransaction();
        try {
            foreach ($sale->details as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->increment('stock_qty', $detail->quantity);
                }
            }

            SaleDetail::where('sale_id', $id)->delete();
            Payment::where('sale_id', $id)->delete();
            $sale->delete();

            DB::commit();
            return response()->json(['message' => 'លុបការលក់ និងបង្វិលស្តុកចូលវិញជោគជ័យ!'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'លុបមិនបានសម្រេច៖ ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ៥. មុខងារគណនា និងទាញយកស្ថិតិសម្រាប់ Dashboard
     */
    public function dashboard()
    {
        try {
            $today = Carbon::today()->toDateString();

            // រាប់ចំនួន Order ថ្ងៃនេះ
            $todaysOrders = Sale::whereDate('sale_date', $today)
                ->orWhereDate('created_at', $today)
                ->count();

            // គណនាប្រាក់ចំណូលថ្ងៃនេះ
            $todaysRevenue = Sale::whereDate('sale_date', $today)
                ->orWhereDate('created_at', $today)
                ->sum('total_amount');

            $totalProducts  = Product::count();
            $totalRevenue   = Sale::sum('total_amount');
            $totalCustomers = Sale::whereNotNull('customer_name')
                ->where('customer_name', '!=', '')
                ->distinct('customer_name')
                ->count('customer_name');

            $recentOrders = Sale::with(['details.product', 'payments'])
                ->orderBy('sale_id', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'todays_orders'   => $todaysOrders,
                'todays_revenue'  => (float) $todaysRevenue,
                'total_products'  => $totalProducts,
                'total_customers' => $totalCustomers,
                'total_revenue'   => (float) $totalRevenue,
                'recent_orders'   => $recentOrders,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
