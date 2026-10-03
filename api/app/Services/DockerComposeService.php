<?php

namespace App\Services;

use App\Models\Sandbox;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Process;

class DockerComposeService
{
    public function __construct(
        public Filesystem $file
    )
    {}

    public function up(Sandbox $sandbox): void
    {
        $directory = storage_path("projects/sandboxes/{$sandbox->project_name}");
        Process::path($directory)
            ->timeout(60)
            ->run([
                '/usr/local/bin/docker', 'compose',
                '--project-name', "{$sandbox->project_name}",
                '--file', 'docker-compose.yml',
                '--env-file', '.env',
                'up', '-d',
            ])
            ->throw();
    }

    public function stop(Sandbox $sandbox): void
    {
        $directory = storage_path("projects/sandboxes/{$sandbox->project_name}");
        Process::path($directory)
            ->timeout(60)
            ->run([
                '/usr/local/bin/docker', 'compose',
                '--project-name', "{$sandbox->project_name}",
                '--file', 'docker-compose.yml',
                '--env-file', '.env',
                'stop',
            ])
            ->throw();
    }

    public function restart(Sandbox $sandbox): void
    {
        $directory = storage_path("projects/sandboxes/{$sandbox->project_name}");

        Process::path($directory)
            ->timeout(60)
            ->run([
                '/usr/local/bin/docker', 'compose',
                '--project-name', $sandbox->project_name,
                '--file', 'docker-compose.yml',
                '--env-file', '.env',
                'restart',
            ])
            ->throw();
    }

    public function start(Sandbox $sandbox): void
    {
        $directory = storage_path("projects/sandboxes/{$sandbox->project_name}");

        Process::path($directory)
            ->timeout(60)
            ->run([
                '/usr/local/bin/docker', 'compose',
                '--project-name', $sandbox->project_name,
                '--file', 'docker-compose.yml',
                '--env-file', '.env',
                'start',
            ])
            ->throw();
    }
}
