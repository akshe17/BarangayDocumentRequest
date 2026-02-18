<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class BaseDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles (This must be done first for the admin user to work)
        $roles = ['admin', 'resident', 'clerk', 'zone leader'];
        foreach ($roles as $roleName) {
            DB::table('roles')->updateOrInsert(
                ['role_name' => $roleName],
      
            );
        }

        // 2. Create the Admin User
        $roleId = DB::table('roles')->where('role_name', 'admin')->value('role_id');
        
        // Check if admin user already exists to prevent duplicate entry error
        $adminExists = DB::table('users')->where('email', 'admin@gmail.com')->exists();

        if (!$adminExists) {
            DB::table('users')->insert([
                'role_id' => $roleId,
                'first_name' => 'Vladimer',
                'last_name' => 'Tuyor',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('12341234'), // Change this password!
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 3. Seed Civil Statuses
        $statuses = ['single', 'married', 'widowed', 'divorced'];
        foreach ($statuses as $status) {
            DB::table('civil_statuses')->updateOrInsert(
                ['status_name' => $status],
               
            );
        }

        // 4. Seed Request Statuses
        $requestStatuses = ['pending', 'approved', 'completed', 'rejected', 'ready for pickup'];
        foreach ($requestStatuses as $statusName) {
            DB::table('request_statuses')->updateOrInsert(
                ['status_name' => $statusName],
               
            );
        }

        // 5. Seed Genders
        $genders = ['male', 'female'];
        foreach ($genders as $gender) {
            DB::table('genders')->updateOrInsert(
                ['gender_name' => $gender],
               
            );
        }
        
        // 6. Seed Zones
        $zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9'];
        foreach ($zones as $zoneName) {
            DB::table('zones')->updateOrInsert(
                ['zone_name' => $zoneName],
                ['created_at' => Carbon::now(), 'updated_at' => Carbon::now()]
            );
        }
    } // <--- The closing brace was moved here
}