<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Create clothing_images directory if it doesn't exist
        if (!Storage::disk('public')->exists('clothing_images')) {
            Storage::disk('public')->makeDirectory('clothing_images');
        }
    }

    /**
     * Upload an image for a clothing item
     */
    public function upload(Request $request, ClothingItem $clothingItem = null)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'clothing_item_id' => 'required_without:clothingItem|exists:clothing_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Get the clothing item
        if (!$clothingItem) {
            $clothingItem = ClothingItem::findOrFail($request->clothing_item_id);
        }

        // Check permission
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        // Handle the file upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($clothingItem->image_path) {
                Storage::disk('public')->delete($clothingItem->image_path);
            }

            // Generate a unique filename
            $filename = 'clothing_images/' . Str::random(20) . '.' . $request->file('image')->getClientOriginalExtension();
            
            // Store the image directly without optimization
            $path = $request->file('image')->storeAs('public', $filename);
            
            // Update the clothing item
            $clothingItem->image_path = $filename;
            $clothingItem->save();

            return response()->json([
                'message' => 'Image uploaded successfully',
                'image_path' => $clothingItem->image_path,
                'image_url' => asset('storage/' . $clothingItem->image_path)
            ]);
        }

        return response()->json([
            'message' => 'No image found in request'
        ], Response::HTTP_BAD_REQUEST);
    }

    /**
     * Delete an image from a clothing item
     */
    public function delete(ClothingItem $clothingItem)
    {
        // Check permission
        if ($clothingItem->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        // Delete the image if exists
        if ($clothingItem->image_path) {
            Storage::disk('public')->delete($clothingItem->image_path);
            
            // Update the clothing item
            $clothingItem->image_path = null;
            $clothingItem->save();

            return response()->json([
                'message' => 'Image deleted successfully'
            ]);
        }

        return response()->json([
            'message' => 'No image to delete'
        ], Response::HTTP_BAD_REQUEST);
    }

    /**
     * Upload multiple images (useful for bulk uploads)
     */
    public function bulkUpload(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'clothing_item_ids' => 'required|array',
            'clothing_item_ids.*' => 'exists:clothing_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Ensure arrays have same length
        if (count($request->images) !== count($request->clothing_item_ids)) {
            return response()->json([
                'message' => 'Number of images and clothing item IDs must match'
            ], Response::HTTP_BAD_REQUEST);
        }

        $results = [];

        // Process each image
        foreach ($request->file('images') as $index => $imageFile) {
            $clothingItemId = $request->clothing_item_ids[$index];
            $clothingItem = ClothingItem::find($clothingItemId);

            // Skip if not found or not owner
            if (!$clothingItem || $clothingItem->user_id !== auth()->id()) {
                $results[] = [
                    'clothing_item_id' => $clothingItemId,
                    'success' => false,
                    'message' => 'Item not found or unauthorized'
                ];
                continue;
            }

            // Delete old image if exists
            if ($clothingItem->image_path) {
                Storage::disk('public')->delete($clothingItem->image_path);
            }

            // Generate a unique filename
            $filename = 'clothing_images/' . Str::random(20) . '.' . $imageFile->getClientOriginalExtension();
            
            // Store the image directly without optimization
            $path = $imageFile->storeAs('public', $filename);
            
            // Update clothing item
            $clothingItem->image_path = $filename;
            $clothingItem->save();

            $results[] = [
                'clothing_item_id' => $clothingItemId,
                'success' => true,
                'image_url' => asset('storage/' . $clothingItem->image_path)
            ];
        }

        return response()->json([
            'message' => 'Bulk upload completed',
            'results' => $results
        ]);
    }
}