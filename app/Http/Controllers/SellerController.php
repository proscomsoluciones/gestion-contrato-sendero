<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSellerRequest;
use App\Http\Requests\UpdateSellerRequest;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SellerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('sellers/index', [
            'sellers' => Seller::query()->withCount('contracts')->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sellers/create');
    }

    public function store(StoreSellerRequest $request): RedirectResponse
    {
        Seller::create($request->validated());

        return to_route('sellers.index');
    }

    public function edit(Seller $seller): Response
    {
        return Inertia::render('sellers/edit', [
            'seller' => $seller,
        ]);
    }

    public function update(UpdateSellerRequest $request, Seller $seller): RedirectResponse
    {
        $seller->update($request->validated());

        return to_route('sellers.index');
    }

    public function destroy(Seller $seller): RedirectResponse
    {
        $seller->delete();

        return to_route('sellers.index');
    }
}
