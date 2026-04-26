<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sandbox extends Model
{
    protected $fillable = ['owner_email', 'status', 'services', 'project_name'];

    protected function casts(): array
    {
        return [
            'services' => 'array',
        ];
    }
}
