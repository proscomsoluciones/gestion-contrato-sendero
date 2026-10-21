<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInstallmentRequest;
use App\Http\Requests\UpdateInstallmentRequest;
use App\Models\Installment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $perPage = $request->integer('per_page', 10);
        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $installments = Installment::query()
            ->with('contract')
            ->when($search !== '', function ($query) use ($search) {
                $query->where('legacy_contract_rut', 'like', "%{$search}%")
                    ->orWhere('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('contract', function ($query) use ($search) {
                        $query->where('rut', 'like', "%{$search}%")
                            ->orWhere('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('installments/index', [
            'installments' => $installments,
            'contractsList' => \App\Models\Contract::query()->orderByDesc('id')->limit(200)->get(['id', 'first_name', 'last_name', 'rut']),
            'filters' => ['q' => $search, 'per_page' => $perPage],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('installments/create');
    }

    public function store(StoreInstallmentRequest $request): RedirectResponse
    {
        Installment::create($request->validated());

        return to_route('installments.index');
    }

    public function edit(Installment $installment): Response
    {
        $installment->load('contract');

        return Inertia::render('installments/edit', [
            'installment' => $installment,
        ]);
    }

    public function update(UpdateInstallmentRequest $request, Installment $installment): RedirectResponse
    {
        $installment->update($request->validated());

        return to_route('installments.index');
    }

    public function destroy(Installment $installment): RedirectResponse
    {
        $installment->delete();

        return to_route('installments.index');
    }
}
