<?php

use App\Http\Controllers\SandboxController;
use App\Http\Controllers\ServicesController;
use Illuminate\Support\Facades\Route;

Route::get('/services', [ServicesController::class, 'index']);
Route::get('/sandboxes', [SandboxController::class, 'index']);
