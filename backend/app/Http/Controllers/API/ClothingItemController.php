<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ClothingItemController extends Controller
{
    public function index(Request $request)
    {
        $query = ClothingItem::with('category')->where('user_id', auth()->id());
        
        // Apply filters if provided
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('favorite')) {
            $query->where('favorite', $request->favorite);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('color', 'like', "%{$search}%");
            });
        }
        
        $clothingItems = $query->latest()->get();
        return response()->json($clothingItems);
    }

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
        
        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('clothing_images', 'public');
            $validated['image_path'] = $path;
        }
        
        // Add user_id to the item
        $validated['user_id'] = auth()->id();
        
        $clothingItem = ClothingItem::create($validated);
        return response()->json($clothingItem, Response::HTTP_CREATED);
    }

    public function show(ClothingItem $clothingItem)
    {
        // Check if the item belongs to the authenticated user
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
        return response()->json($clothingItem->load('category'));
    }

    public function update(Request $request, ClothingItem $clothingItem)
    {
        // Check if the item belongs to the authenticated user
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
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
        
        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($clothingItem->image_path) {
                Storage::disk('public')->delete($clothingItem->image_path);
            }
            
            $path = $request->file('image')->store('clothing_images', 'public');
            $validated['image_path'] = $path;
        }
        
        $clothingItem->update($validated);
        return response()->json($clothingItem);
    }

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