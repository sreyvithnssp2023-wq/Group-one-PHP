<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ProductController extends Controller
{
    // ១. ទាញយកបញ្ជីទំនិញទាំងអស់ (សម្រាប់ React បង្ហាញក្នុង Table)
    public function index()
    {
        try {
            if (!Schema::hasTable('products')) {
                return response()->json([]);
            }

            // ប្រសិនបើ Table products នៅទទេ ធ្វើ Auto-Seed ទិន្នន័យគំរូជាភាសាខ្មែរ
            if (DB::table('products')->count() === 0) {
                if (class_exists(\Database\Seeders\DatabaseSeeder::class)) {
                    app(\Database\Seeders\DatabaseSeeder::class)->run();
                }
            }

            $cols  = Schema::getColumnListing('products');
            $idCol = in_array('id', $cols) ? 'id' : $cols[0];

            $products = DB::table('products')
                ->orderBy($idCol, 'desc')
                ->get()
                ->map(function ($p) {
                    $pName      = $p->name ?? $p->product_name ?? '';
                    $stockQty   = $p->stock ?? $p->stock_qty ?? 0;
                    $barcodeVal = $p->barcode ?? $p->sku ?? 'N/A';
                    $catVal     = $p->category ?? $p->category_id ?? 'General';
                    $warranty   = (int) ($p->warranty_months ?? $p->warranty ?? 0);

                    return [
                        'id'              => $p->id,
                        'name'            => $pName,
                        'product_name'    => $pName,
                        'title'           => $pName,
                        'category'        => $catVal,
                        'sku'             => $barcodeVal,
                        'barcode'         => $barcodeVal,
                        'price'           => (float) ($p->price ?? 0),
                        'cost'            => (float) ($p->cost ?? 0),
                        'stock'           => (int) $stockQty,
                        'stock_qty'       => (int) $stockQty,
                        'warranty_months' => $warranty,
                        'status'          => $stockQty > 0 ? 'In Stock' : 'Out of Stock',
                        'image'           => $p->image ?? null,
                        'created_at'      => $p->created_at ?? null,
                        'updated_at'      => $p->updated_at ?? null,
                    ];
                });

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ២. បន្ថែមទំនិញថ្មី + រូបភាព + បង្កើតប័ណ្ណធានាស្វ័យប្រវត្តិ (Auto-Warranty Record)
    public function store(Request $request)
    {
        $request->validate([
            'price' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            $cols = Schema::getColumnListing('products');
            $data = [];

            // ឈ្មោះទំនិញ
            $pName = $request->product_name ?? $request->name ?? 'ទំនិញថ្មី';
            if (in_array('name', $cols)) {
                $data['name'] = $pName;
            } elseif (in_array('product_name', $cols)) {
                $data['product_name'] = $pName;
            }

            // ប្រភេទទំនិញ
            if (in_array('category', $cols)) {
                $data['category'] = $request->category ?? 'General';
            } elseif (in_array('category_id', $cols)) {
                $data['category_id'] = $request->category_id ?? $request->category;
            }

            // SKU / Barcode
            $barcodeVal = $request->barcode ?? $request->sku;
            if (in_array('barcode', $cols)) {
                $data['barcode'] = $barcodeVal;
            } elseif (in_array('sku', $cols)) {
                $data['sku'] = $barcodeVal;
            }

            // តម្លៃដើម និង តម្លៃលក់
            if (in_array('cost', $cols)) {
                $data['cost'] = $request->cost ?? 0;
            }
            if (in_array('price', $cols)) {
                $data['price'] = $request->price ?? 0;
            }

            // ចំនួនស្តុក
            $stockVal = $request->stock_qty ?? $request->stock ?? 0;
            if (in_array('stock', $cols)) {
                $data['stock'] = $stockVal;
            } elseif (in_array('stock_qty', $cols)) {
                $data['stock_qty'] = $stockVal;
            }

            // រយៈពេលធានា (គិតជាខែ)
            $warrantyMonths = (int) ($request->warranty_months ?? $request->warranty ?? 0);
            if (in_array('warranty_months', $cols)) {
                $data['warranty_months'] = $warrantyMonths;
            } elseif (in_array('warranty', $cols)) {
                $data['warranty'] = $warrantyMonths;
            }

            // រូបភាព
            if ($request->hasFile('image') && in_array('image', $cols)) {
                $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
                $request->file('image')->move(public_path('uploads/products'), $imageName);
                $data['image'] = 'uploads/products/' . $imageName;
            }

            if (in_array('created_at', $cols)) $data['created_at'] = now();
            if (in_array('updated_at', $cols)) $data['updated_at'] = now();

            $id = DB::table('products')->insertGetId($data);

            // 🛡️ បង្កើតទិន្នន័យការធានាចូល Table warranties ដោយស្វ័យប្រវត្តិប្រសិនបើមានបញ្ចូលខែធានា
            if ($warrantyMonths > 0 && Schema::hasTable('warranties')) {
                $wCols = Schema::getColumnListing('warranties');
                $warrantyData = [];

                if (in_array('product_id', $wCols)) $warrantyData['product_id'] = $id;
                if (in_array('product_name', $wCols)) $warrantyData['product_name'] = $pName;
                if (in_array('customer_name', $wCols)) $warrantyData['customer_name'] = $request->customer_name ?? 'In Stock / ក្នុងស្តុក';
                if (in_array('customer_phone', $wCols)) $warrantyData['customer_phone'] = $request->customer_phone ?? 'N/A';
                if (in_array('warranty_months', $wCols)) $warrantyData['warranty_months'] = $warrantyMonths;
                if (in_array('start_date', $wCols)) $warrantyData['start_date'] = now()->toDateString();
                if (in_array('end_date', $wCols)) $warrantyData['end_date'] = now()->addMonths($warrantyMonths)->toDateString();
                if (in_array('status', $wCols)) $warrantyData['status'] = 'Active';
                if (in_array('created_at', $wCols)) $warrantyData['created_at'] = now();
                if (in_array('updated_at', $wCols)) $warrantyData['updated_at'] = now();

                DB::table('warranties')->insert($warrantyData);
            }

            DB::commit();

            return response()->json(array_merge(['id' => $id], $data), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៣. ទាញយកទំនិញមួយតាម ID
    public function show($id)
    {
        try {
            $p = DB::table('products')->where('id', $id)->first();
            if (!$p) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $pName      = $p->name ?? $p->product_name ?? '';
            $stockQty   = $p->stock ?? $p->stock_qty ?? 0;
            $barcodeVal = $p->barcode ?? $p->sku ?? 'N/A';
            $warranty   = (int) ($p->warranty_months ?? $p->warranty ?? 0);

            $result = [
                'id'              => $p->id,
                'name'            => $pName,
                'product_name'    => $pName,
                'category'        => $p->category ?? 'General',
                'sku'             => $barcodeVal,
                'barcode'         => $barcodeVal,
                'price'           => (float) ($p->price ?? 0),
                'cost'            => (float) ($p->cost ?? 0),
                'stock'           => (int) $stockQty,
                'stock_qty'       => (int) $stockQty,
                'warranty_months' => $warranty,
                'status'          => $stockQty > 0 ? 'In Stock' : 'Out of Stock',
                'image'           => $p->image ?? null,
            ];

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៤. កែប្រែទំនិញ + រូបភាព
    public function update(Request $request, $id)
    {
        try {
            $product = DB::table('products')->where('id', $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $cols = Schema::getColumnListing('products');
            $data = [];

            $pName = $request->product_name ?? $request->name;
            if ($pName) {
                if (in_array('name', $cols)) $data['name'] = $pName;
                if (in_array('product_name', $cols)) $data['product_name'] = $pName;
            }

            if ($request->has('price') && in_array('price', $cols)) {
                $data['price'] = $request->price;
            }
            if ($request->has('cost') && in_array('cost', $cols)) {
                $data['cost'] = $request->cost;
            }

            $stockVal = $request->stock_qty ?? $request->stock;
            if ($stockVal !== null) {
                if (in_array('stock', $cols)) $data['stock'] = $stockVal;
                if (in_array('stock_qty', $cols)) $data['stock_qty'] = $stockVal;
            }

            $warrantyVal = $request->warranty_months ?? $request->warranty;
            if ($warrantyVal !== null) {
                if (in_array('warranty_months', $cols)) $data['warranty_months'] = (int) $warrantyVal;
                if (in_array('warranty', $cols)) $data['warranty'] = (int) $warrantyVal;
            }

            if ($request->has('category') && in_array('category', $cols)) {
                $data['category'] = $request->category;
            }

            if ($request->hasFile('image') && in_array('image', $cols)) {
                if ($product->image && file_exists(public_path($product->image))) {
                    @unlink(public_path($product->image));
                }
                $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
                $request->file('image')->move(public_path('uploads/products'), $imageName);
                $data['image'] = 'uploads/products/' . $imageName;
            }

            if (in_array('updated_at', $cols)) $data['updated_at'] = now();

            DB::table('products')->where('id', $id)->update($data);

            return response()->json(['message' => 'Product updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៥. លុបទំនិញ + លុបរូបភាព និងលុបការធានាក្រោមទំនិញនេះ
    public function destroy($id)
    {
        try {
            $product = DB::table('products')->where('id', $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            if ($product->image && file_exists(public_path($product->image))) {
                @unlink(public_path($product->image));
            }

            DB::table('products')->where('id', $id)->delete();

            // លុបការធានាចាស់ពាក់ព័ន្ធនឹងទំនិញនេះចេញពី Table warranties
            if (Schema::hasTable('warranties')) {
                DB::table('warranties')->where('product_id', $id)->delete();
            }

            return response()->json(['message' => 'Product deleted successfully!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
