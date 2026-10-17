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

            // បើក Auto Seed ប្រសិនបើ Table គ្មានទិន្នន័យ
            if (DB::table('categories')->count() === 0) {
                $this->seedCategories();
            }

            $catCols = Schema::getColumnListing('categories');
            $idCol   = in_array('id', $catCols) ? 'id' : (in_array('category_id', $catCols) ? 'category_id' : $catCols[0]);

            // ✅ ឆែករក Column 'title' មុនគេបង្អស់ ឱ្យត្រូវគ្នានឹង Database Structure
            $nameCol = 'name';
            if (in_array('title', $catCols)) {
                $nameCol = 'title';
            } elseif (in_array('category_name', $catCols)) {
                $nameCol = 'category_name';
            } elseif (in_array('name', $catCols)) {
                $nameCol = 'name';
            }

            $categories = DB::table('categories')
                ->orderBy($idCol, 'asc')
                ->get()
                ->map(function ($c) use ($idCol, $nameCol) {
                    $catId   = $c->$idCol;
                    $catName = $c->$nameCol ?? 'General';

                    // រាប់ចំនួន Products
                    $productCount = 0;
                    if (Schema::hasTable('products')) {
                        $pQuery     = DB::table('products');
                        $hasCatId   = Schema::hasColumn('products', 'category_id');
                        $hasCatName = Schema::hasColumn('products', 'category');

                        if ($hasCatId) {
                            $productCount = $pQuery->where('category_id', $catId)->count();
                        } elseif ($hasCatName) {
                            $productCount = $pQuery->where('category', $catName)->count();
                        }
                    }

                    $sortVal = isset($c->sort) ? $c->sort : (isset($c->sort_order) ? $c->sort_order : $catId);

                    return [
                        'id'             => $catId,
                        'name'           => $catName,
                        'title'          => $catName,
                        'slug'           => $c->slug ?? Str::slug($catName),
                        'sort'           => $sortVal,
                        'sort_order'     => $sortVal,
                        'products'       => $productCount,
                        'products_count' => $productCount,
                    ];
                });

            return response()->json($categories, 200);
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

            // ✅ ចាក់ចូល Column 'title' ប្រសិនបើ Database មាន Column នេះ
            if (in_array('title', $catCols)) {
                $data['title'] = $request->name;
            } elseif (in_array('category_name', $catCols)) {
                $data['category_name'] = $request->name;
            } elseif (in_array('name', $catCols)) {
                $data['name'] = $request->name;
            }

            if (in_array('slug', $catCols)) {
                $data['slug'] = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
            }

            $sortVal = $request->sort_order ?? $request->sort ?? (DB::table('categories')->count() + 1);
            if (in_array('sort_order', $catCols)) {
                $data['sort_order'] = $sortVal;
            } elseif (in_array('sort', $catCols)) {
                $data['sort'] = $sortVal;
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
            $idCol   = in_array('id', $catCols) ? 'id' : (in_array('category_id', $catCols) ? 'category_id' : $catCols[0]);

            $data = [];
            if (in_array('title', $catCols))         $data['title']         = $request->name;
            if (in_array('category_name', $catCols)) $data['category_name'] = $request->name;
            if (in_array('name', $catCols))          $data['name']          = $request->name;

            if (in_array('slug', $catCols)) {
                $data['slug'] = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
            }

            $sortVal = $request->sort_order ?? $request->sort;
            if (in_array('sort_order', $catCols)) $data['sort_order'] = $sortVal;
            if (in_array('sort', $catCols))       $data['sort']       = $sortVal;
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
            $idCol   = in_array('id', $catCols) ? 'id' : (in_array('category_id', $catCols) ? 'category_id' : $catCols[0]);

            DB::table('categories')->where($idCol, $id)->delete();
            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ✅ Auto Seed ត្រឹមត្រូវតាម Table structure (id, title, created_at, updated_at)
    private function seedCategories()
    {
        $catCols = Schema::getColumnListing('categories');
        $defaultCategories = [
            ['name' => 'Phones', 'slug' => 'phones', 'sort' => 1],
            ['name' => 'Accessories', 'slug' => 'accessories', 'sort' => 2],
            ['name' => 'Tablets', 'slug' => 'tablets', 'sort' => 3],
            ['name' => 'Laptops', 'slug' => 'laptops', 'sort' => 4],
        ];

        foreach ($defaultCategories as $cat) {
            $data = [];
            if (in_array('title', $catCols))         $data['title']         = $cat['name'];
            if (in_array('category_name', $catCols)) $data['category_name'] = $cat['name'];
            if (in_array('name', $catCols))          $data['name']          = $cat['name'];

            if (in_array('slug', $catCols))          $data['slug']          = $cat['slug'];
            if (in_array('sort_order', $catCols))    $data['sort_order']    = $cat['sort'];
            if (in_array('sort', $catCols))          $data['sort']          = $cat['sort'];

            if (in_array('created_at', $catCols))    $data['created_at']    = now();
            if (in_array('updated_at', $catCols))    $data['updated_at']    = now();

            DB::table('categories')->insert($data);
        }
    }
}
