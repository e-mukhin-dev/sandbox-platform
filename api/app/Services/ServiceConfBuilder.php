<?php

namespace App\Services;

use Illuminate\Filesystem\Filesystem;

class ServiceConfBuilder
{
    public function __construct(
        protected Filesystem $file,
    ) {}

    public function build(array $services, string $sandboxName): array
    {
        $files = [];
        foreach ($services as $service) {
            $sandboxConfPath = storage_path("projects/sandboxes/$sandboxName/" . $service['name']);
            $sourceConfPath = storage_path("/conf/{$service['name']}.conf");
            if($this->file->exists($sourceConfPath))
            {
                $files[$sandboxConfPath] = $sourceConfPath;
            }
        }
        return $files;
    }
}
