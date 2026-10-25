<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Models\Commune;
use App\Models\Contract;
use App\Models\Seller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractController extends Controller
{
    /**
     * Búsqueda liviana usada por el selector de contrato en Pagos/Cuotas
     * (hay miles de contratos, no se cargan todos en un <select>).
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->string('q')->trim()->toString();

        if ($search === '') {
            return response()->json([]);
        }

        $contracts = Contract::query()
            ->where(function ($query) use ($search) {
                $query->where('rut', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->orderByDesc('contract_date')
            ->limit(10)
            ->get(['id', 'rut', 'first_name', 'last_name'])
            ->map(fn (Contract $contract) => [
                'id' => $contract->id,
                'label' => "{$contract->first_name} {$contract->last_name} · {$contract->rut}",
            ]);

        return response()->json($contracts);
    }

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $perPage = $request->integer('per_page', 10);
        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $contracts = Contract::query()
            ->with(['commune', 'seller'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('rut', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('beneficiary_first_name', 'like', "%{$search}%")
                        ->orWhere('beneficiary_last_name', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contracts/index', [
            'contracts' => $contracts,
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
            'sellers' => Seller::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'q' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }


    public function create(): Response
    {
        return Inertia::render('contracts/create', [
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
            'sellers' => Seller::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreContractRequest $request): RedirectResponse
    {
        $contract = Contract::create([
            ...$request->validated(),
            'is_installment_plan' => $request->boolean('is_installment_plan'),
        ]);

        $this->generateInstallments($contract);

        return to_route('contracts.edit', $contract);
    }

    public function edit(Contract $contract): Response
    {
        $contract->load(['commune', 'seller', 'installments', 'payments']);

        return Inertia::render('contracts/edit', [
            'contract' => $contract,
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
            'sellers' => Seller::query()->orderBy('name')->get(['id', 'name']),
            'hasPdf' => $contract->pdf_path !== null && Storage::disk('local')->exists($contract->pdf_path),
        ]);
    }

    public function update(UpdateContractRequest $request, Contract $contract): RedirectResponse
    {
        $contract->update([
            ...$request->validated(),
            'is_installment_plan' => $request->boolean('is_installment_plan'),
        ]);

        $this->generateInstallments($contract);

        return to_route('contracts.index');
    }

    public function destroy(Contract $contract): RedirectResponse
    {
        $contract->delete();

        return to_route('contracts.index');
    }

    public function downloadPdf(Contract $contract)
    {
        $contract->load(['commune', 'seller', 'installments', 'payments']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('contracts.pdf', ['contract' => $contract])
            ->setPaper('letter', 'portrait');

        return $pdf->stream("contrato-{$contract->id}-{$contract->rut}.pdf");
    }

    private function generateInstallments(Contract $contract): void
    {
        if (! $contract->is_installment_plan || ! $contract->installments_count || $contract->installments_count < 1) {
            return;
        }

        $total = (float) ($contract->total ?? 0);
        $downPayment = (float) ($contract->down_payment ?? 0);
        $mortuaryQuota = (float) ($contract->mortuary_quota ?? 0);
        $balance = max(0.0, $total - $downPayment - $mortuaryQuota);

        if ($balance <= 0) {
            return;
        }

        $count = (int) $contract->installments_count;
        $baseAmount = floor($balance / $count);
        $remainder = $balance - ($baseAmount * $count);

        $existingPaidCount = $contract->installments()->where(function ($q) {
            $q->where('status', 'pagada')
                ->orWhere('status', 'pagado')
                ->orWhereNotNull('paid_at');
        })->count();

        if ($existingPaidCount === 0) {
            $contract->installments()->delete();

            $startDate = $contract->first_due_date
                ? \Illuminate\Support\Carbon::parse($contract->first_due_date)
                : ($contract->contract_date
                    ? \Illuminate\Support\Carbon::parse($contract->contract_date)->addMonth()
                    : \Illuminate\Support\Carbon::now()->addMonth());

            for ($i = 1; $i <= $count; $i++) {
                $installmentAmount = ($i === 1) ? ($baseAmount + $remainder) : $baseAmount;
                $dueDate = $startDate->copy()->addMonths($i - 1)->format('Y-m-d');

                \App\Models\Installment::create([
                    'contract_id' => $contract->id,
                    'legacy_contract_rut' => $contract->rut,
                    'amount' => $installmentAmount,
                    'due_date' => $dueDate,
                    'status' => 'Pendiente',
                ]);
            }
        }
    }




}
