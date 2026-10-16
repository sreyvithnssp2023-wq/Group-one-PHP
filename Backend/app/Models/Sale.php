<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $table = 'sales';
    protected $primaryKey = 'sale_id'; // ប្រសិនបើ Primary Key ក្នុង Database ឈ្មោះ 'id' សូមប្តូរទៅ 'id'

    // បើកឱ្យ Laravel កត់ត្រាcreated_at និង updated_at ស្វ័យប្រវត្តិ
    public $timestamps = true;

    protected $fillable = [
        'customer_id',
        'user_id',
        'customer_name', // 👈 បានបន្ថែមចំណុចនេះ
        'sale_date',
        'total_amount',
        'discount',
        'payment_status'
    ];

    public function details()
    {
        return $this->hasMany(SaleDetail::class, 'sale_id', 'sale_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'sale_id', 'sale_id');
    }
}
