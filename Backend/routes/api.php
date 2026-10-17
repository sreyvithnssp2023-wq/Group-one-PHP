<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WarrantyController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 📊 Dashboard Statistics Route
Route::get('/dashboard', [SaleController::class, 'dashboard']);

// 📈 Reports Routes (គាំទ្រគ្រប់ Sub-routes & URL Patterns)
Route::get('/reports', [SaleController::class, 'reports']);
Route::get('/report', [SaleController::class, 'reports']);
Route::get('/sales/reports', [SaleController::class, 'reports']);
Route::get('/reports/{type}', [SaleController::class, 'reports']);
Route::get('/report/{type}', [SaleController::class, 'reports']);

// 📱 Product Routes
Route::post('/products/full-add', [SupplierController::class, 'storeProductWithSupplier']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products/{id}', [ProductController::class, 'update']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// 🚚 Supplier Routes
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);
Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

// 🛒 Sale Routes
Route::get('/sales', [SaleController::class, 'index']);
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/sales/{id}', [SaleController::class, 'show']);
Route::delete('/sales/{id}', [SaleController::class, 'destroy']);

// 📁 Category Routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

// 💳 Payment Routes
Route::get('/payments', [PaymentController::class, 'index']);
Route::post('/payments', [PaymentController::class, 'store']);
Route::get('/payments/{id}', [PaymentController::class, 'show']);
// ធានា
Route::apiResource('warranties', WarrantyController::class);
