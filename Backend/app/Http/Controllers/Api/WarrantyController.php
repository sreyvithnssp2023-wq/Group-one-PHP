<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class WarrantyController extends Controller
{
    /**
     * ១. ទាញយកបញ្ជីការធានាទាំងអស់ + Auto-Sync ទំនិញពី products
     */
    public function index()
    {
        try {
            if (!Schema::hasTable('warranties')) {
                return response()->json([], 200);
            }

            // 🔄 AUTO-SYNC ៖ ទាញយកទំនិញពី products មកបញ្ចូលក្នុង warranties តាម Structure ពិត
            if (Schema::hasTable('products')) {
                $existingSerials = DB::table('warranties')->pluck('imei_serial')->toArray();
                $products        = DB::table('products')->get();

                foreach ($products as $p) {
                    $pName  = $p->name ?? $p->product_name ?? 'ទំនិញ';
                    $serial = $p->sku ?? $p->barcode ?? ('SN-' . sprintf('%04d', $p->id));

                    if (!in_array($serial, $existingSerials)) {
                        $months    = (int) ($p->warranty_months ?? $p->warranty ?? 12);
                        if ($months <= 0) $months = 12;

                        $purchaseDate = Carbon::parse($p->created_at ?? now())->toDateString();
                        $expiryDate   = Carbon::parse($p->created_at ?? now())->addMonths($months)->toDateString();

                        DB::table('warranties')->insert([
                            'customer_name'     => 'អតិថិជនទូទៅ',
                            'customer_phone'    => 'N/A',
                            'imei_serial'       => $serial,
                            'product_name'      => $pName,
                            'invoice_number'    => 'INV-' . time() . '-' . $p->id,
                            'purchase_date'     => $purchaseDate,
                            'warranty_months'   => $months,
                            'expiry_date'       => $expiryDate,
                            'warranty_type'     => 'Store',
                            'issue_description' => 'ទំនិញក្នុងស្តុក (Auto Created)',
                            'status'            => 'Pending',
                            'created_at'        => now(),
                            'updated_at'        => now(),
                        ]);
                    }
                }
            }

            // ទាញយកទិន្នន័យពី Table warranties តាម Primary Key warranty_id
            $warranties = DB::table('warranties')->orderBy('warranty_id', 'desc')->get();

            $formatted = $warranties->map(function ($item) {
                $expStr    = $item->expiry_date ?? now()->addYear()->toDateString();
                $expiry    = Carbon::parse($expStr);
                $now       = Carbon::now()->startOfDay();
                $daysLeft  = (int) $now->diffInDays($expiry, false);

                return [
                    'id'                => $item->warranty_id,
                    'warranty_id'       => $item->warranty_id,
                    'product_name'      => $item->product_name ?? 'ទំនិញ',
                    'serial_number'     => $item->imei_serial ?? 'N/A',
                    'imei_serial'       => $item->imei_serial ?? 'N/A',
                    'customer_name'     => $item->customer_name ?? 'អតិថិជនទូទៅ',
                    'customer_phone'    => $item->customer_phone ?? 'N/A',
                    'start_date'        => $item->purchase_date ?? now()->toDateString(),
                    'purchase_date'     => $item->purchase_date ?? now()->toDateString(),
                    'expiry_date'       => $expStr,
                    'end_date'          => $expStr,
                    'warranty_months'   => (int) ($item->warranty_months ?? 12),
                    'warranty_type'     => $item->warranty_type ?? 'Store',
                    'days_remaining'    => $daysLeft,
                    'is_expired'        => $daysLeft < 0,
                    'status'            => $item->status ?? ($daysLeft < 0 ? 'Completed' : 'Pending'),
                    'notes'             => $item->issue_description ?? '',
                    'issue_description' => $item->issue_description ?? '',
                ];
            });

            return response()->json($formatted, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * ២. បន្ថែមការធានាថ្មី (POST /api/warranties)
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_name'  => 'required|string',
                'customer_name' => 'required|string',
            ]);

            $purchaseDate = $request->purchase_date ?? $request->start_date ?? now()->toDateString();
            $months       = (int) ($request->warranty_months ?? 12);
            $expiryDate   = $request->expiry_date ?? Carbon::parse($purchaseDate)->addMonths($months)->toDateString();

            $id = DB::table('warranties')->insertGetId([
                'customer_name'     => $request->customer_name,
                'customer_phone'    => $request->customer_phone ?? 'N/A',
                'imei_serial'       => $request->imei_serial ?? $request->serial_number ?? ('SN-' . time()),
                'product_name'      => $request->product_name,
                'invoice_number'    => $request->invoice_number ?? ('INV-' . time()),
                'purchase_date'     => $purchaseDate,
                'warranty_months'   => $months,
                'expiry_date'       => $expiryDate,
                'warranty_type'     => $request->warranty_type ?? 'Store',
                'issue_description' => $request->issue_description ?? $request->notes ?? '',
                'status'            => $request->status ?? 'Pending',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            return response()->json(['message' => 'បន្ថែមការធានាជោគជ័យ!', 'id' => $id], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ៣. លុបប័ណ្ណធានា
     */
    public function destroy($id)
    {
        try {
            if (Schema::hasTable('warranties')) {
                DB::table('warranties')->where('warranty_id', $id)->delete();
            }
            return response()->json(['message' => 'លុបការធានាជោគជ័យ!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
