<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    protected $table = 'Main.ServiceCategory';

    protected $fillable = [
        'name',
    ];

    public function services()
    {
        return $this->hasMany(ServiceType::class, 'service_category_id');
    }
}
