<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->string('date')->trim()->toString();
        $search = $request->string('q')->trim()->toString();
        $perPage = $request->integer('per_page', 10);
        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $payments = Payment::query()
            ->with('contract')
            ->when($date !== '', fn ($query) => $query->whereDate('paid_at', $date))
            ->when($search !== '', function ($query) use ($search) {
                $query->where('legacy_client_rut', 'like', "%{$search}%")
                    ->orWhereHas('contract', function ($query) use ($search) {
                        $query->where('rut', 'like', "%{$search}%")
                            ->orWhere('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'contractsList' => \App\Models\Contract::query()->orderByDesc('id')->limit(100)->get(['id', 'first_name', 'last_name', 'rut']),
            'filters' => ['date' => $date, 'q' => $search, 'per_page' => $perPage],
        ]);
    }


    public function create(): Response
    {
        return Inertia::render('payments/create');
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $payment = Payment::create($request->validated());

        $this->generateReceipt($payment);

        return to_route('payments.index');
    }

    public function edit(Payment $payment): Response
    {
        $payment->load('contract');

        return Inertia::render('payments/edit', [
            'payment' => $payment,
            'hasReceipt' => $payment->receipt_path !== null && Storage::disk('local')->exists($payment->receipt_path),
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $payment->update($request->validated());

        return to_route('payments.index');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $payment->delete();

        return to_route('payments.index');
    }

    public function downloadReceipt(Payment $payment)
    {
        $payment->load('contract');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.payment', ['payment' => $payment])
            ->setPaper('letter', 'portrait');

        return $pdf->stream("comprobante-pago-{$payment->id}.pdf");
    }




    private function generateReceipt(Payment $payment): void
    {
        $payment->load('contract');

        $path = "receipts/{$payment->id}.pdf";

        Pdf::view('receipts.payment', ['payment' => $payment])
            ->driver('dompdf')
            ->disk('local')
            ->save($path);

        $payment->update(['receipt_path' => $path]);
    }
}
