<?php

namespace App\Domains\Customer\Domain\Repositories;

use App\Domains\Customer\Domain\Models\Appointment;

interface AppointmentRepositoryInterface
{
    public function getAll();
    public function findById(int $id): ?Appointment;
    public function create(array $data): Appointment;
    public function update(int $id, array $data): Appointment;
    public function delete(int $id): bool;
    public function getNextAppointmentCode(): string;
}
