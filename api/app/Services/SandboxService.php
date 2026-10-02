<?php

namespace App\Services;

use App\Jobs\CreateSandboxJob;
use App\Models\Sandbox;
use Illuminate\Support\Facades\Log;

class SandboxService
{
    public function create(array $sandboxData): Sandbox
    {
        try {
            $sandbox = Sandbox::create($sandboxData);
            CreateSandboxJob::dispatch($sandbox)->onQueue('sandboxes');
            return $sandbox;
        }catch (\Throwable $exception) {
            Log::error('Sandbox creation error', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
                'payload' => $sandboxData,
            ]);

            throw $exception;
        }
    }
}
