<?php

return [
    'php' => [
        'name' => 'php',
        'label' => 'PHP',
        'description' => 'PHP runtime',
        'versions' => ['8.2', '8.3'],
        'default_version' => '8.2',
    ],
    'nginx' => [
        'name' => 'nginx',
        'label' => 'Nginx',
        'description' => 'Web server',
        'versions' => ['alpine'],
        'default_version' => 'alpine',
    ],
    'postgres' => [
        'name' => 'postgres',
        'label' => 'PostgreSQL',
        'description' => 'Database',
        'versions' => ['18.6'],
        'default_version' => '18.6',
    ],
];
