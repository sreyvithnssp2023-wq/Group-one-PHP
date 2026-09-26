<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // ១. ទាញយកបញ្ជី Category ទាំងអស់
    public function index()
    {
        return response()->json(Category::all(), 200);
    }

    // ២. បន្ថែម Category ថ្មី
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create([
            'name'        => $request->name,
            'description' => $request->description ?? null,
        ]);

        return response()->json($category, 201);
    }

    // ៣. មើល Category មួយតាម ID
    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'រកមិនឃើញប្រភេទទំនិញឡើយ'], 404);
        }
        return response()->json($category, 200);
    }

    // ៤. កែប្រែ Category
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'រកមិនឃើញប្រភេទទំនិញឡើយ'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category->update([
            'name'        => $request->name,
            'description' => $request->description ?? $category->description,
        ]);

        return response()->json($category, 200);
    }

    // ៥. លុប Category
    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'រកមិនឃើញប្រភេទទំនិញឡើយ'], 404);
        }

        $category->delete();
        return response()->json(['message' => 'លុបប្រភេទទំនិញជោគជ័យ!'], 200);
    }
}
