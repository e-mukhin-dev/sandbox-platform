<?php

namespace App\Services;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class EnvBuilder
{
    public function __construct(
        public Filesystem $file,
    ) {}

    public function build(): string
    {
        $env = [
            'DB_PASSWORD' => Str::random(32)
        ];
        $envString = "";
        foreach ($env as $name => $value) {
            $envString .= "$name=$value\n";
        }
        return $envString;
    }
}
