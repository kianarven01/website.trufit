<?php

namespace App\Domains\Customer\Infrastructure\Repositories;

use App\Domains\Customer\Domain\Models\Appointment;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;

class EloquentAppointmentRepository implements AppointmentRepositoryInterface
{
    public function getAll()
    {
        return Appointment::with(['customer', 'vehicle'])->get();
    }

    public function findById(int $id): ?Appointment
    {
        return Appointment::with(['customer', 'vehicle'])->find($id);
    }

    public function create(array $data): Appointment
    {
        return Appointment::create($data);
    }

    public function update(int $id, array $data): Appointment
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update($data);
        return $appointment->fresh(['customer', 'vehicle']);
    }

    public function delete(int $id): bool
    {
        $appointment = Appointment::findOrFail($id);
        return $appointment->delete();
    }

    public function getNextAppointmentCode(): string
    {
        $lastAppointment = Appointment::orderBy('id', 'desc')->first();
        if (!$lastAppointment) {
            return 'APT-0001';
        }

        $lastCode = $lastAppointment->appointment_code;
        $lastNumber = (int) str_replace('APT-', '', $lastCode);
        $nextNumber = $lastNumber + 1;

        return 'APT-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
