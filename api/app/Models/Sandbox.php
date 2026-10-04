<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Sandbox extends Model
{
    protected $fillable = ['owner_email', 'status', 'services', 'project_name', 'error_message'];
    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'services' => 'array',
        ];
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => sprintf(
                '%s://%s.%s',
                config('sandbox.scheme', 'http'),
                $this->project_name,
                config('sandbox.base_domain'),
            ),
        );
    }
}
