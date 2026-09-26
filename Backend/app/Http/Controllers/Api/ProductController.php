<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // ១. ទាញយកបញ្ជីទំនិញទាំងអស់ (សម្រាប់ React បង្ហាញក្នុង Table)
    public function index()
    {
        $products = Product::all();
        return response()->json($products, 200);
    }

    // ២. បន្ថែមទំនិញថ្មី + រូបភាព
    public function store(Request $request)
    {
        $request->validate([
            'product_name' => 'required',
            'price'        => 'required|numeric',
            'stock_qty'    => 'required|integer',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $imagePath = null;

        // ប្រសិនបើមាន File រូបភាពផ្ញើមក
        if ($request->hasFile('image')) {
            $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            // រក្សារូបភាពក្នុង folder: public/uploads/products
            $request->file('image')->move(public_path('uploads/products'), $imageName);
            $imagePath = 'uploads/products/' . $imageName;
        }

        $product = Product::create([
            'product_name' => $request->product_name,
            'price'        => $request->price,
            'stock_qty'    => $request->stock_qty,
            'image'        => $imagePath,
        ]);

        return response()->json($product, 201);
    }

    // ៣. ទាញយកទំនិញមួយតាម ID
    public function show($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return response()->json($product, 200);
    }

    // ៤. កែប្រែទំនិញ + រូបភាព
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'product_name' => 'required',
            'price'        => 'required|numeric',
            'stock_qty'    => 'required|integer',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // លុបរូបចាស់ចោលបើមាន
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }

            $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $request->file('image')->move(public_path('uploads/products'), $imageName);
            $product->image = 'uploads/products/' . $imageName;
        }

        $product->product_name = $request->product_name;
        $product->price = $request->price;
        $product->stock_qty = $request->stock_qty;
        $product->save();

        return response()->json($product, 200);
    }

    // ៥. លុបទំនិញ + លុបរូបភាពចេញពី Folder
    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // លុបរូបភាពក្នុង Folder uploads ចោល
        if ($product->image && file_exists(public_path($product->image))) {
            unlink(public_path($product->image));
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully!'], 200);
    }
}
