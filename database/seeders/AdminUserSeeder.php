<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@rubriq.local');
        $password = env('ADMIN_PASSWORD', 'PasswordAdmin123!');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'password' => $password, // otomatis ke-hash karena casts() password => 'hashed'
                'role' => 'admin',
                'instructor_status' => 'none',
		'email_verified_at' => now(),
            ]
        );
    }
}
