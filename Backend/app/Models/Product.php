<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'product_name',
        'category',
        'category_id',
        'brand_id',
        'supplier_id',
        'sku',
        'barcode',
        'imei',
        'price',
        'cost',
        'cost_price',
        'stock',
        'stock_qty',
        'warranty_months',
        'status',
        'image'
    ];
}
