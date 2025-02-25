<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ClothingItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Categories
    Route::apiResource('categories', CategoryController::class);
    
    // Clothing Items
    Route::apiResource('clothing-items', ClothingItemController::class);
});