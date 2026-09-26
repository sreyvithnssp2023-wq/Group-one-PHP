<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $table = 'sales';
    protected $primaryKey = 'sale_id'; // ប្រសិនបើ Primary Key ក្នុង Database ឈ្មោះ 'id' សូមប្តូរទៅ 'id'
    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'user_id',
        'sale_date',
        'total_amount',
        'discount',
        'payment_status'
    ];

    // មុខងារនេះហើយដែល Laravel រកមិនឃើញ (ត្រូវតែមាន)
    public function details()
    {
        return $this->hasMany(SaleDetail::class, 'sale_id', 'sale_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'sale_id', 'sale_id');
    }
}
