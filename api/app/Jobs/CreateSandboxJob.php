<?php

namespace App\Jobs;

use App\Models\Sandbox;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Process\Exceptions\ProcessFailedException;
use Throwable;

class CreateSandboxJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Sandbox $sandbox,
    )
    {}

    public function handle(\App\Domains\Sandbox $sandbox): void
    {
        $sandbox->create($this->sandbox);
    }
}
