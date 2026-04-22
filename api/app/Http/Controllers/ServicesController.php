<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ServicesController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            collect(config('docker.services'))
                ->map(fn ($data, $name) => [
                    'name' => $name,
                    ...$data,
                ])
                ->values()
        );
    }
}
