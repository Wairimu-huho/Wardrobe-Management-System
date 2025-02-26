<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $query = Category::query();
        
        // Apply search filter if provided
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Get categories with count of items
        $categories = $query->withCount('clothingItems')->get();
        
        return response()->json($categories);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories',
            'description' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:30',
            'color' => 'nullable|string|max:20',
        ]);

        $category = Category::create($validated);
        
        return response()->json($category, Response::HTTP_CREATED);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        return response()->json($category->load(['clothingItems' => function($query) {
            $query->where('user_id', auth()->id());
        }]));
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:50|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:30',
            'color' => 'nullable|string|max:20',
        ]);

        $category->update($validated);
        
        return response()->json($category);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category)
    {
        // Check if category has any items
        $itemCount = $category->clothingItems()->count();
        
        if ($itemCount > 0) {
            return response()->json([
                'message' => 'Cannot delete category that has clothing items. Please reassign or delete the items first.',
                'item_count' => $itemCount
            ], Response::HTTP_CONFLICT);
        }
        
        $category->delete();
        
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}