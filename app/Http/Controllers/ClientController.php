<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use App\Models\Commune;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $perPage = $request->integer('per_page', 10);
        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $clients = Client::query()
            ->with('commune')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('rut', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage)

            ->withQueryString();

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'q' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }



    public function create(): Response
    {
        return Inertia::render('clients/create', [
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        Client::create([
            ...$request->validated(),
            'includes_van' => $request->boolean('includes_van'),
            'includes_car' => $request->boolean('includes_car'),
        ]);

        return to_route('clients.index');
    }

    public function edit(Client $client): Response
    {
        return Inertia::render('clients/edit', [
            'client' => $client,
            'communes' => Commune::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $client->update([
            ...$request->validated(),
            'includes_van' => $request->boolean('includes_van'),
            'includes_car' => $request->boolean('includes_car'),
        ]);

        return to_route('clients.index');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return to_route('clients.index');
    }
}
