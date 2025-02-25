<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ClothingItemController extends Controller
{
    /**
     * Display a listing of the resource with advanced filtering.
     */
    public function index(Request $request)
    {
        $query = ClothingItem::with('category')
            ->where('user_id', auth()->id());
        
        // Text Search (across multiple fields)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('brand', 'like', "%{$searchTerm}%")
                  ->orWhere('color', 'like', "%{$searchTerm}%");
            });
        }
        
        // Filter by category
        if ($request->has('category_id') && !empty($request->category_id)) {
            if (is_array($request->category_id)) {
                $query->whereIn('category_id', $request->category_id);
            } else {
                $query->where('category_id', $request->category_id);
            }
        }
        
        // Filter by color
        if ($request->has('color') && !empty($request->color)) {
            if (is_array($request->color)) {
                $query->whereIn('color', $request->color);
            } else {
                $query->where('color', 'like', "%{$request->color}%");
            }
        }
        
        // Filter by size
        if ($request->has('size') && !empty($request->size)) {
            if (is_array($request->size)) {
                $query->whereIn('size', $request->size);
            } else {
                $query->where('size', $request->size);
            }
        }
        
        // Filter by brand
        if ($request->has('brand') && !empty($request->brand)) {
            if (is_array($request->brand)) {
                $query->whereIn('brand', $request->brand);
            } else {
                $query->where('brand', 'like', "%{$request->brand}%");
            }
        }
        
        // Filter by favorite status
        if ($request->has('favorite')) {
            $query->where('favorite', $request->favorite == 'true' || $request->favorite == '1');
        }
        
        // Filter by created date range
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Sorting
        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        
        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'brand', 'color', 'size', 'created_at', 'updated_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        // Validate sort order
        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }
        
        $query->orderBy($sortField, $sortOrder);
        
        // Pagination
        $perPage = $request->per_page ?? 15;
        if ($perPage > 100) $perPage = 100; // Limit maximum items per page
        
        $clothingItems = $query->paginate($perPage);
        return response()->json($clothingItems);
    }

    /**
     * Get metadata for filters (available colors, sizes, brands)
     */
    public function filterMetadata()
    {
        $userId = auth()->id();
        
        $metadata = [
            'colors' => ClothingItem::where('user_id', $userId)
                ->select('color')
                ->distinct()
                ->whereNotNull('color')
                ->orderBy('color')
                ->pluck('color'),
                
            'sizes' => ClothingItem::where('user_id', $userId)
                ->select('size')
                ->distinct()
                ->whereNotNull('size')
                ->orderBy('size')
                ->pluck('size'),
                
            'brands' => ClothingItem::where('user_id', $userId)
                ->select('brand')
                ->distinct()
                ->whereNotNull('brand')
                ->orderBy('brand')
                ->pluck('brand'),
                
            'categories_count' => DB::table('clothing_items')
                ->select('category_id', DB::raw('count(*) as count'))
                ->where('user_id', $userId)
                ->groupBy('category_id')
                ->get()
        ];
        
        return response()->json($metadata);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'color' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:20',
            'brand' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
            'favorite' => 'boolean',
        ]);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('clothing_images', 'public');
            $validated['image_path'] = $path;
        }
        
        // Add user_id to the item
        $validated['user_id'] = auth()->id();
        
        $clothingItem = ClothingItem::create($validated);
        return response()->json($clothingItem, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(ClothingItem $clothingItem)
    {
        // Check if the item belongs to the authenticated user
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
        return response()->json($clothingItem->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClothingItem $clothingItem)
    {
        // Check if the item belongs to the authenticated user
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'color' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:20',
            'brand' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
            'favorite' => 'boolean',
        ]);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($clothingItem->image_path) {
                Storage::disk('public')->delete($clothingItem->image_path);
            }
            
            $path = $request->file('image')->store('clothing_images', 'public');
            $validated['image_path'] = $path;
        }
        
        $clothingItem->update($validated);
        return response()->json($clothingItem->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClothingItem $clothingItem)
    {
        // Check if the item belongs to the authenticated user
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
        // Delete image if exists
        if ($clothingItem->image_path) {
            Storage::disk('public')->delete($clothingItem->image_path);
        }
        
        $clothingItem->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}