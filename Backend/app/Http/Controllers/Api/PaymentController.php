<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // ១. ទាញយកប្រវត្តិការបង់ប្រាក់ទាំងអស់ (ភ្ជាប់ជាមួយព័ត៌មាននៃការលក់)
    public function index()
    {
        $payments = Payment::with('sale')
            ->orderBy('payment_id', 'desc') // ឬ orderBy('id', 'desc') តាម Primary Key
            ->get();

        return response()->json($payments, 200);
    }

    // ២. បង្កើត Payment ថ្មី (មាន Validation ត្រឹមត្រូវ)
    public function store(Request $request)
    {
        $request->validate([
            'sale_id'        => 'required',
            'amount'         => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        $payment = Payment::create([
            'sale_id'        => $request->sale_id,
            'amount'         => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_date'   => $request->payment_date ?? now(),
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'data'    => $payment
        ], 201);
    }

    // ៣. ទាញយកព័ត៌មាន Payment មួយតាម ID
    public function show($id)
    {
        $payment = Payment::with('sale')->find($id);

        if (!$payment) {
            return response()->json(['message' => 'រកមិនឃើញប្រវត្តិបង់ប្រាក់នេះទេ'], 404);
        }

        return response()->json($payment, 200);
    }

    // ៤. កែប្រែព័ត៌មាន Payment
    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'រកមិនឃើញប្រវត្តិបង់ប្រាក់នេះទេ'], 404);
        }

        $request->validate([
            'amount'         => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
        ]);

        $payment->update([
            'amount'         => $request->amount ?? $payment->amount,
            'payment_method' => $request->payment_method ?? $payment->payment_method,
            'payment_date'   => $request->payment_date ?? $payment->payment_date,
        ]);

        return response()->json([
            'message' => 'ធ្វើបច្ចុប្បន្នភាពការបង់ប្រាក់ជោគជ័យ!',
            'data'    => $payment
        ], 200);
    }

    // ៥. លុបប្រវត្តិ Payment
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'រកមិនឃើញប្រវត្តិបង់ប្រាក់នេះទេ'], 404);
        }

        $payment->delete();

        return response()->json(['message' => 'លុបប្រវត្តិបង់ប្រាក់ជោគជ័យ!'], 200);
    }
}
