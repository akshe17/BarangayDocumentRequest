<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gender;
class GenderController extends Controller
{
public function index() {
    // We fetch the data and rename it on the fly so React doesn't break
    return Gender::All();
}
}
