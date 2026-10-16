<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // 1. ទាញយកបញ្ជីប្រភេទទំនិញ + រាប់ចំនួន Product
    public function index()
    {
        try {
            if (!Schema::hasTable('categories')) {
                return response()->json([]);
            }

            $catCols = Schema::getColumnListing('categories');
            $idCol   = in_array('category_id', $catCols) ? 'category_id' : (in_array('id', $catCols) ? 'id' : $catCols[0]);
            $nameCol = in_array('category_name', $catCols) ? 'category_name' : (in_array('name', $catCols) ? 'name' : $catCols[1] ?? 'name');
            $sortCol = in_array('sort_order', $catCols) ? 'sort_order' : (in_array('sort', $catCols) ? 'sort' : null);

            $query = DB::table('categories');
            if ($sortCol) {
                $query->orderBy($sortCol, 'asc');
            } else {
                $query->orderBy($idCol, 'asc');
            }

            $categories = $query->get()->map(function ($c) use ($idCol, $nameCol, $sortCol) {
                $catId = $c->$idCol;

                // រាប់ចំនួន Products ដែលនៅក្នុង Category នេះ
                $productCount = 0;
                if (Schema::hasTable('products') && Schema::hasColumn('products', 'category_id')) {
                    $productCount = DB::table('products')->where('category_id', $catId)->count();
                }

                return [
                    'id'             => $catId,
                    'name'           => $c->$nameCol ?? '',
                    'slug'           => $c->slug ?? Str::slug($c->$nameCol ?? ''),
                    'sort_order'     => $sortCol ? ($c->$sortCol ?? 1) : 1,
                    'products_count' => $productCount,
                ];
            });

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. បន្ថែម Category ថ្មី
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $catCols = Schema::getColumnListing('categories');
            $data = [];

            if (in_array('category_name', $catCols)) {
                $data['category_name'] = $request->name;
            } elseif (in_array('name', $catCols)) {
                $data['name'] = $request->name;
            }

            if (in_array('slug', $catCols)) {
                $data['slug'] = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
            }

            if (in_array('sort_order', $catCols)) {
                $data['sort_order'] = $request->sort_order ?? (DB::table('categories')->count() + 1);
            } elseif (in_array('sort', $catCols)) {
                $data['sort'] = $request->sort_order ?? (DB::table('categories')->count() + 1);
            }

            if (in_array('created_at', $catCols)) $data['created_at'] = now();
            if (in_array('updated_at', $catCols)) $data['updated_at'] = now();

            $id = DB::table('categories')->insertGetId($data);

            return response()->json(['message' => 'Category created successfully', 'id' => $id], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. កែប្រែ Category
    public function update(Request $request, $id)
    {
        try {
            $catCols = Schema::getColumnListing('categories');
            $idCol   = in_array('category_id', $catCols) ? 'category_id' : 'id';

            $data = [];
            if (in_array('category_name', $catCols)) $data['category_name'] = $request->name;
            if (in_array('name', $catCols))          $data['name']          = $request->name;

            if (in_array('slug', $catCols)) {
                $data['slug'] = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
            }

            if (in_array('sort_order', $catCols)) $data['sort_order'] = $request->sort_order;
            if (in_array('sort', $catCols))       $data['sort']       = $request->sort_order;
            if (in_array('updated_at', $catCols)) $data['updated_at'] = now();

            DB::table('categories')->where($idCol, $id)->update($data);

            return response()->json(['message' => 'Category updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 4. លុប Category
    public function destroy($id)
    {
        try {
            $catCols = Schema::getColumnListing('categories');
            $idCol   = in_array('category_id', $catCols) ? 'category_id' : 'id';

            DB::table('categories')->where($idCol, $id)->delete();
            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
