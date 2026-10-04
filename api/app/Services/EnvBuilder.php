<?php

namespace App\Services;

use App\Models\Sandbox;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class EnvBuilder
{
    public function __construct(
        public Filesystem $file,
    ) {}

    public function build(Sandbox $sandbox): string
    {
        $env = [
            'DB_PASSWORD' => Str::random(32),
            'SANDBOX_NAME' => $sandbox->project_name,
            'SANDBOX_ROOT' => base_path("api/storage/projects/sandboxes"),
            'SANDBOX_HOST' => $sandbox->project_name . '.' . config('sandbox.base_domain')
        ];
        $envString = "";
        foreach ($env as $name => $value) {
            $envString .= "$name=$value\n";
        }
        return $envString;
    }
}
