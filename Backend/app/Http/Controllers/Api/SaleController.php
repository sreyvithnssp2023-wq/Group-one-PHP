<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    // ១. ទាញយកប្រវត្តិលក់ទាំងអស់ (រួមទាំង Details និង Payment សម្រាប់បង្ហាញក្បាលវិក្កយបត្រ)
    public function index()
    {
        $sales = Sale::with(['details.product', 'payments'])
            ->orderBy('sale_id', 'desc')
            ->get();

        return response()->json($sales, 200);
    }

    // ២. មុខងារ Checkout គិតលុយ និងកាត់ស្តុក (POS)
    public function store(Request $request)
    {
        // Validate Data ជាមុនសិន
        $request->validate([
            'total_amount' => 'required|numeric',
            'items'        => 'required|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            // ១. ផ្ទៀងផ្ទាត់ស្តុកទំនិញជាមុនសិន
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $item) {
                    $productId = $item['product_id'] ?? $item['id'];
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
                            'message' => "ទំនិញ '{$product->product_name}' មិនមានស្តុកគ្រប់គ្រាន់ទេ! (ក្នុងស្តុកសល់ត្រឹមតែ {$product->stock_qty})"
                        ], 400);
                    }
                }
            }

            // ២. បង្កើតកំណត់ត្រាលក់ (Sale)
            $sale = Sale::create([
                'customer_id'    => $request->customer_id ?? null,
                'user_id'        => $request->user_id ?? null,
                'sale_date'      => now(),
                'total_amount'   => $request->total_amount,
                'discount'       => $request->discount ?? 0,
                'payment_status' => $request->payment_status ?? 'Paid',
            ]);

            // ទាញយក Primary Key របស់ Sale
            $saleId = $sale->sale_id ?? $sale->id;

            // ៣. បង្កើតប្រវត្តិបង់ប្រាក់ (Payment)
            Payment::create([
                'sale_id'        => $saleId,
                'payment_method' => $request->payment_method ?? 'Cash',
                'amount'         => $request->total_amount,
                'payment_date'   => now(),
            ]);

            // ៤. បញ្ចូល Sale Details និងកាត់ស្តុកទំនិញពី Database
            if ($request->has('items') && is_array($request->items)) {
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

                    // កាត់ស្តុកទំនិញ
                    $product = Product::find($productId);
                    if ($product) {
                        $product->stock_qty = $product->stock_qty - $qty;
                        $product->save();
                    }
                }
            }

            DB::commit();

            // Load Details និង Payment ដើម្បីផ្ញើទៅ React ចេញវិក្កយបត្រ (Receipt)
            $sale->load(['details.product', 'payments']);

            return response()->json([
                'message' => 'Sale recorded successfully',
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

    // ៣. មើលព័ត៌មានលក់តាម ID (រួមទាំង Details សម្រាប់បោះពុម្ព Receipt)
    public function show($id)
    {
        $sale = Sale::with(['details.product', 'payments'])->find($id);

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale, 200);
    }

    // ៤. លុបប្រតិបត្តិការលក់ + បង្វិលចំនួនស្តុកចូលវិញ (Restock)
    public function destroy($id)
    {
        $sale = Sale::with('details')->find($id);

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        DB::beginTransaction();
        try {
            // បង្វិលស្តុកចូលទំនិញវិញ
            foreach ($sale->details as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->increment('stock_qty', $detail->quantity);
                }
            }

            // លុបព័ត៌មានដែលទាក់ទង
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
}
