<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CreateUserCommand extends Command
{
    protected $signature = 'users:create {name} {email}';

    protected $description = 'Crea un usuario del staff con una contraseña aleatoria (reemplaza el alta manual del sistema viejo)';

    public function handle(): int
    {
        $data = Validator::make(
            ['name' => $this->argument('name'), 'email' => $this->argument('email')],
            ['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255', 'unique:users,email']],
        )->validate();

        $password = Str::password(16);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        $this->components->info("Usuario {$data['email']} creado.");
        $this->line("Contraseña temporal: {$password}");
        $this->warn('Guardala ahora: no se puede volver a mostrar. Pedile a la persona que la cambie al iniciar sesión.');

        return self::SUCCESS;
    }
}
