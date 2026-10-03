<?php

namespace App\Services;

use App\Models\Sandbox;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Process;

class SandboxWorkspace
{
    public function __construct(
        public Filesystem $file,
        private ComposeBuilder $composeBuilder,
        private EnvBuilder $envBuilder,
        private ServiceConfBuilder $serviceConfBuilder,
    ) {}

    public function prepare(Sandbox $sandbox): void
    {
        $directory = storage_path("projects/sandboxes/{$sandbox->project_name}");
        $this->file->ensureDirectoryExists($directory);

        $composeYaml = $this->composeBuilder->build($sandbox->services);
        $env = $this->envBuilder->build($sandbox);
        $configs = $this->serviceConfBuilder->build($sandbox->services, $sandbox->project_name);

        $this->file->put($directory . '/docker-compose.yml', $composeYaml);
        $this->file->put($directory . '/.env', $env);
        foreach ($configs as $conf => $source) {
            $this->file->ensureDirectoryExists($conf);
            $this->file->copy($source, $conf . '/default.conf');
        }

        $this->file->ensureDirectoryExists($directory . '/app/public/');
        $this->file->copy(storage_path("default-pages/index.html"), $directory . '/app/public/index.html');

        $sandbox->update([
            'status' => 'running'
        ]);
    }

    public function setStatusStopped(Sandbox $sandbox): void
    {
        $sandbox->update([
            'status' => 'stopped'
        ]);
    }

    public function setStatusRunning(Sandbox $sandbox): void
    {
        $sandbox->update([
            'status' => 'running',
        ]);
    }
}
