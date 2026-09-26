<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'product_id';
    public $timestamps = false;

    protected $fillable = [
        'product_name',
        'category_id',
        'brand_id',
        'sku',
        'imei',
        'price',
        'cost_price',
        'stock_qty',
        'warranty_months',
        'status',
        'image'
    ];
}
