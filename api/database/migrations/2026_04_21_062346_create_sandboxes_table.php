<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sandboxes', function (Blueprint $table) {
            $table->id();

            $table->string('owner_email');
            $table->string('status')->default('pending');
            $table->json('services');
            $table->string('project_name')->nullable()->unique();
            $table->timestamps();

            $table->text('error_message')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sandboxes');
    }
};
