<?php
// app/Http/Controllers/ZoneController.php
namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
   public function index(){
    // This is valid
    return response()->json(Zone::get());
   }
}