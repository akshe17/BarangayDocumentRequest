<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CivilStatus;
class CivilStatusController extends Controller
{
    public function index(){
        return CivilStatus::all();
    }
}
