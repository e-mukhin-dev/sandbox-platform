<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateSandboxRequest;
use App\Models\Sandbox;
use App\Services\SandboxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

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

    public function store(CreateSandboxRequest $request, SandboxService $sandboxService): JsonResponse
    {
        $sandbox = $sandboxService->create($request->validated());
        return response()->json($sandbox, 201);
    }
}
