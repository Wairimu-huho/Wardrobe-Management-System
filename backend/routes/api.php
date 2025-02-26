<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ClothingItemController;
use App\Http\Controllers\API\ImageUploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Resources
    Route::apiResource('categories', CategoryController::class);
    
    // Clothing Items routes
    Route::get('clothing-items/filter-metadata', [ClothingItemController::class, 'filterMetadata']);
    Route::apiResource('clothing-items', ClothingItemController::class);
    
    // Image upload routes
    Route::post('images/upload/{clothingItem?}', [ImageUploadController::class, 'upload']);
    Route::delete('images/{clothingItem}', [ImageUploadController::class, 'delete']);
    Route::post('images/bulk-upload', [ImageUploadController::class, 'bulkUpload']);
});