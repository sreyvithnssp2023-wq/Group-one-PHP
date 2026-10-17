<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. បង្កើត និង បញ្ចូល Categories គំរូ
        if (Schema::hasTable('categories')) {
            DB::table('categories')->truncate();
            $catCols = Schema::getColumnListing('categories');
            $categories = ['Phones', 'Accessories', 'Tablets', 'Laptops'];

            foreach ($categories as $index => $cat) {
                $data = ['created_at' => now(), 'updated_at' => now()];
                if (in_array('title', $catCols)) $data['title'] = $cat;
                if (in_array('name', $catCols)) $data['name'] = $cat;
                if (in_array('category_name', $catCols)) $data['category_name'] = $cat;
                DB::table('categories')->insert($data);
            }
        }

        // 2. បញ្ចូល Suppliers គំរូ
        if (Schema::hasTable('suppliers')) {
            DB::table('suppliers')->truncate();
            DB::table('suppliers')->insert([
                [
                    'name'           => 'ក្រុមហ៊ុន អង្គរ អេឡិចត្រូនិច',
                    'contact_person' => 'លោក សុខា',
                    'phone'          => '012 345 678',
                    'email'          => 'supplier@angkor.com',
                    'address'        => 'រាជធានីភ្នំពេញ, កម្ពុជា',
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ],
                [
                    'name'           => 'ហាង ខ្មែរ តិចណូឡូជី',
                    'contact_person' => 'កញ្ញា បុប្ផា',
                    'phone'          => '098 765 432',
                    'email'          => 'tech@khmer.com',
                    'address'        => 'ខេត្តសៀមរាប, កម្ពុជា',
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ],
            ]);
        }

        // 3. បញ្ចូល Products គំរូជាភាសាខ្មែរត្រូវតាម Columns (id, name, category, barcode, price, cost, stock, image)
        if (Schema::hasTable('products')) {
            DB::table('products')->truncate();

            $products = [
                // --- PHONES ---
                [
                    'name'       => 'iPhone 16 Pro Max 256GB (Black Titanium)',
                    'category'   => 'Phones',
                    'barcode'    => 'IP16PM-256-BLK',
                    'price'      => 1299.00,
                    'cost'       => 1050.00,
                    'stock'      => 20,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Samsung Galaxy S24 Ultra 512GB',
                    'category'   => 'Phones',
                    'barcode'    => 'SS-S24U-512',
                    'price'      => 1180.00,
                    'cost'       => 980.00,
                    'stock'      => 15,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Xiaomi 14 Ultra 512GB (White)',
                    'category'   => 'Phones',
                    'barcode'    => 'MI-14U-512',
                    'price'      => 890.00,
                    'cost'       => 750.00,
                    'stock'      => 10,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],

                // --- ACCESSORIES ---
                [
                    'name'       => 'កាសប៊្លូធូស AirPods Pro (2nd Gen)',
                    'category'   => 'Accessories',
                    'barcode'    => 'ACC-APP2-01',
                    'price'      => 229.00,
                    'cost'       => 180.00,
                    'stock'      => 30,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'ដុំសាកលឿន Anker 65W Fast Charger',
                    'category'   => 'Accessories',
                    'barcode'    => 'ANK-65W-USB',
                    'price'      => 29.00,
                    'cost'       => 18.00,
                    'stock'      => 50,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'នាឡិកាវៃឆ្លាត Apple Watch Series 9 45mm',
                    'category'   => 'Accessories',
                    'barcode'    => 'AW-S9-45-BLK',
                    'price'      => 399.00,
                    'cost'       => 320.00,
                    'stock'      => 12,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],

                // --- TABLETS ---
                [
                    'name'       => 'iPad Pro 11-inch M4 256GB WiFi',
                    'category'   => 'Tablets',
                    'barcode'    => 'IPAD-M4-256',
                    'price'      => 999.00,
                    'cost'       => 880.00,
                    'stock'      => 8,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Samsung Galaxy Tab S9 Ultra 256GB',
                    'category'   => 'Tablets',
                    'barcode'    => 'SAMSUNG-TABS9U',
                    'price'      => 950.00,
                    'cost'       => 820.00,
                    'stock'      => 6,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],

                // --- LAPTOPS ---
                [
                    'name'       => 'MacBook Air 13-inch M3 (8GB / 256GB)',
                    'category'   => 'Laptops',
                    'barcode'    => 'MBA-M3-256-SLV',
                    'price'      => 1099.00,
                    'cost'       => 920.00,
                    'stock'      => 10,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'ASUS ROG Zephyrus G16 Gaming Laptop',
                    'category'   => 'Laptops',
                    'barcode'    => 'ASUS-ROG-G16',
                    'price'      => 1599.00,
                    'cost'       => 1350.00,
                    'stock'      => 5,
                    'image'      => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];

            DB::table('products')->insert($products);
        }
    }
}
