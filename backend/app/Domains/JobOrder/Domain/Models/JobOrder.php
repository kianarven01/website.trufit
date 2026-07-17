<?php

namespace App\Domains\JobOrder\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Employee\Domain\Models\Employee;

class JobOrder extends Model
{
    use HasUuids;

    protected $table = 'Main.JobOrder';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'SaleOrderID',
        'VehicleID',
        'TechnicianID',
        'date',
        'status',
        'vehicle_id_new',
        'jo_number',
        'timer_status',
        'timer_started_at',
        'timer_total_seconds',
    ];

    protected $casts = [
        'date' => 'datetime',
        'timer_started_at' => 'datetime',
        'timer_total_seconds' => 'integer',
    ];

    protected $appends = [
        'joNumber',
    ];

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'SaleOrderID', 'id');
    }

    public function technician()
    {
        return $this->belongsTo(Employee::class, 'TechnicianID', 'id');
    }

    public function technicians()
    {
        return $this->hasMany(JobOrderTechnician::class, 'JobOrderID', 'id');
    }

    public function activeTechnicians()
    {
        return $this->technicians()->whereNull('removed_at');
    }

    public function services()
    {
        return $this->hasMany(JobOrderService::class, 'JobOrderID', 'id');
    }

    public function vehicle()
    {
        return $this->belongsTo(CustomerVehicle::class, 'vehicle_id_new', 'id');
    }

    public function billingStatements()
    {
        return $this->hasMany(\App\Domains\Billing\Domain\Models\BillingStatement::class, 'JOID', 'id');
    }

    public function statusRecord()
    {
        return $this->belongsTo(\App\Domains\Status\Domain\Models\Status::class, 'status', 'id');
    }

    public function getJoNumberAttribute(): ?string
    {
        return $this->attributes['jo_number'] ?? null;
    }

    public static function generateJoNumber(): string
    {
        $prefix = 'JO-' . now()->format('ymd') . '-';
        do {
            $number = $prefix . str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('jo_number', $number)->exists());
        return $number;
    }

    /**
     * Get elapsed seconds for live timer display.
     * If timer is running, adds current session time to total.
     */
    public function getElapsedSecondsAttribute(): int
    {
        $total = $this->timer_total_seconds ?? 0;

        if ($this->timer_status === 'running' && $this->timer_started_at) {
            $elapsed = now()->diffInSeconds($this->timer_started_at, false);
            $total += max(0, (int) $elapsed);
        }

        return $total;
    }
}
