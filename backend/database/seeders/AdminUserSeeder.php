<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure the 'Admin' role exists (if you don't have a RolesTableSeeder)
        // Adjust the 'role_name' column name based on your actual roles table
        $roleId = DB::table('roles')->where('role_name', 'admin')->value('role_id');

        if (!$roleId) {
            $roleId = DB::table('roles')->insertGetId([
                'role_name' => 'admin',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 2. Create the Admin User
        DB::table('users')->insert([
            'role_id' => $roleId,
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12341234'), // Change this password!
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}