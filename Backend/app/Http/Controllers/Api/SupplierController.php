<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SupplierController extends Controller
{
    // 1. ទាញយកបញ្ជីអ្នកផ្គត់ផ្គង់
    public function index()
    {
        try {
            if (!Schema::hasTable('suppliers')) {
                return response()->json([]);
            }

            $columns = Schema::getColumnListing('suppliers');
            $idCol   = in_array('supplier_id', $columns) ? 'supplier_id' : (in_array('id', $columns) ? 'id' : $columns[0]);
            $nameCol = in_array('supplier_name', $columns) ? 'supplier_name' : (in_array('name', $columns) ? 'name' : ($columns[1] ?? 'name'));

            $suppliers = DB::table('suppliers')->get()->map(function ($s) use ($idCol, $nameCol) {
                return [
                    'id'             => $s->$idCol ?? null,
                    'name'           => $s->$nameCol ?? '',
                    'contact_person' => $s->contact_person ?? $s->contact_name ?? '',
                    'phone'          => $s->phone ?? '',
                    'email'          => $s->email ?? '',
                    'address'        => $s->address ?? '',
                ];
            });

            return response()->json($suppliers);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            if (!Schema::hasTable('suppliers')) {
                return response()->json(['error' => 'Table suppliers does not exist in database!'], 500);
            }

            $columns = Schema::getColumnListing('suppliers');
            $data = [];

            if (in_array('supplier_name', $columns)) {
                $data['supplier_name'] = $request->name;
            } elseif (in_array('name', $columns)) {
                $data['name'] = $request->name;
            } elseif (in_array('company_name', $columns)) {
                $data['company_name'] = $request->name;
            } else {
                $data[$columns[1] ?? 'supplier_name'] = $request->name;
            }

            if (in_array('contact_person', $columns)) {
                $data['contact_person'] = $request->contact_person ?? '';
            } elseif (in_array('contact_name', $columns)) {
                $data['contact_name'] = $request->contact_person ?? '';
            }

            if (in_array('phone', $columns))   $data['phone']   = $request->phone ?? '';
            if (in_array('email', $columns))   $data['email']   = $request->email ?? '';
            if (in_array('address', $columns)) $data['address'] = $request->address ?? '';

            if (in_array('created_at', $columns)) $data['created_at'] = now();
            if (in_array('updated_at', $columns)) $data['updated_at'] = now();

            $id = DB::table('suppliers')->insertGetId($data);

            return response()->json(['message' => 'Supplier added successfully', 'id' => $id], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. កែប្រែទិន្នន័យអ្នកផ្គត់ផ្គង់
    public function update(Request $request, $id)
    {
        try {
            $columns = Schema::getColumnListing('suppliers');
            $idCol   = in_array('supplier_id', $columns) ? 'supplier_id' : 'id';

            $data = [];
            if (in_array('supplier_name', $columns)) $data['supplier_name'] = $request->name;
            if (in_array('name', $columns))          $data['name']          = $request->name;
            if (in_array('contact_person', $columns)) $data['contact_person'] = $request->contact_person ?? '';
            if (in_array('contact_name', $columns))   $data['contact_name']   = $request->contact_person ?? '';
            if (in_array('phone', $columns))          $data['phone']          = $request->phone ?? '';
            if (in_array('email', $columns))          $data['email']          = $request->email ?? '';
            if (in_array('address', $columns))        $data['address']        = $request->address ?? '';
            if (in_array('updated_at', $columns))     $data['updated_at']     = now();

            DB::table('suppliers')->where($idCol, $id)->update($data);

            return response()->json(['message' => 'Supplier updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 4. លុបអ្នកផ្គត់ផ្គង់
    public function destroy($id)
    {
        try {
            $columns = Schema::getColumnListing('suppliers');
            $idCol   = in_array('supplier_id', $columns) ? 'supplier_id' : 'id';

            DB::table('suppliers')->where($idCol, $id)->delete();
            return response()->json(['message' => 'Supplier deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 5. បន្ថែមទំនិញពេញលេញ ( Full Add Product - ប្រើ DB Direct ការពារ Error Class Not Found)
    public function storeProductWithSupplier(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ]);

        try {
            $imageUrl = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/products'), $filename);
                $imageUrl = 'uploads/products/' . $filename;
            }

            $columns = Schema::getColumnListing('products');
            $insertData = [];

            // លាងសម្អាតតម្លៃ integer / decimal
            $categoryId = !empty($request->category_id) ? $request->category_id : null;
            $supplierId = !empty($request->supplier_id) ? $request->supplier_id : null;
            $costPrice  = ($request->cost_price !== null && $request->cost_price !== '') ? $request->cost_price : 0;
            $sku        = !empty($request->sku) ? $request->sku : null;

            if (in_array('product_name', $columns)) $insertData['product_name'] = $request->name;
            elseif (in_array('name', $columns))     $insertData['name']         = $request->name;

            if (in_array('sku', $columns))         $insertData['sku']         = $sku;
            if (in_array('category_id', $columns)) $insertData['category_id'] = $categoryId;
            if (in_array('supplier_id', $columns)) $insertData['supplier_id'] = $supplierId;
            if (in_array('price', $columns))       $insertData['price']       = $request->price;
            if (in_array('cost_price', $columns))  $insertData['cost_price']  = $costPrice;

            if (in_array('stock_qty', $columns))    $insertData['stock_qty']   = $request->stock;
            elseif (in_array('stock', $columns))   $insertData['stock']       = $request->stock;

            if (in_array('status', $columns))      $insertData['status']      = 'Active';
            if ($imageUrl && in_array('image', $columns)) $insertData['image'] = $imageUrl;

            if (in_array('created_at', $columns))  $insertData['created_at']  = now();
            if (in_array('updated_at', $columns))  $insertData['updated_at']  = now();

            // បញ្ចូលទៅ Database ដោយមិនប្រើ Eloquent Model Class
            $productId = DB::table('products')->insertGetId($insertData);

            return response()->json([
                'message' => 'Product added successfully!',
                'product_id' => $productId
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
