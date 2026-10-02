<?php

namespace App\Services;

use Illuminate\Filesystem\Filesystem;
use Symfony\Component\Yaml\Yaml;

class ComposeBuilder
{

    public function __construct(
        private Filesystem $file,
    ) {}

    public function build(array $services): string
    {
        $composeYaml = [];
        foreach ($services as $service) {
            $sourceFilePath = storage_path("services/{$service['name']}.yaml");
            $content = $this->file->get($sourceFilePath);
            $yaml = Yaml::parse($content);
            $composeYaml['services'] = array_merge($composeYaml['services'] ?? [], $yaml['services'] ?? []);
            $composeYaml['volumes'] = array_merge($composeYaml['volumes'] ?? [], $yaml['volumes'] ?? []);
            $composeYaml['networks'] = array_merge($composeYaml['networks'] ?? [], $yaml['networks'] ?? []);
        }
        return Yaml::dump($composeYaml, 10, 2);
    }
}
