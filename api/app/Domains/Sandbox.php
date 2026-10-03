<?php

namespace App\Domains;

use App\Services\DockerComposeService;
use App\Services\SandboxWorkspace;

class Sandbox
{
    public function __construct(
        private SandboxWorkspace $sandboxWorkspace,
        private DockerComposeService $composeService
    ) {}

    public function create(\App\Models\Sandbox $sandbox): void
    {
        $this->sandboxWorkspace->prepare($sandbox);

        $this->composeService->up($sandbox);
    }

    public function stop(\App\Models\Sandbox $sandbox): void
    {
        $this->composeService->stop($sandbox);

        $this->sandboxWorkspace->setStatusStopped($sandbox);
    }
}
