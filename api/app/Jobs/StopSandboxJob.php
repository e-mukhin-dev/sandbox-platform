<?php

namespace App\Jobs;

use App\Models\Sandbox;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class StopSandboxJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Sandbox $sandbox,
    )
    {}

    public function handle(\App\Domains\Sandbox $sandbox): void
    {
        $sandbox->stop($this->sandbox);
    }
}
