<?php

namespace App\Http\Controllers;

use App\Models\Sandbox;
use Illuminate\Http\JsonResponse;

class SandboxController extends Controller
{
    public function index(): JsonResponse
    {
        $sandboxes = Sandbox::query()
            ->select([
                'project_name',
                'owner_email',
                'services',
                'created_at',
                'updated_at',
            ])
            ->latest()
            ->get();
        return response()->json($sandboxes);
    }
}
