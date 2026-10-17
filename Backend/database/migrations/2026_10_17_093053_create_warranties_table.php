<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranties', function (Blueprint $table) {
            $table->id('warranty_id');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('imei_serial')->index();
            $table->string('product_name');
            $table->string('invoice_number')->nullable();
            $table->date('purchase_date');
            $table->integer('warranty_months')->default(12);
            $table->date('expiry_date');
            $table->enum('warranty_type', ['Store', 'Official'])->default('Store');
            $table->text('issue_description')->nullable();
            $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Replaced', 'Rejected'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
