<?php

namespace App\Domains\Status\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Status extends Model
{
    use HasUuids;

    protected $table = 'Main.Status';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'category',
    ];
}
