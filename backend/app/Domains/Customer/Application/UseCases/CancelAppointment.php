<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;

class CancelAppointment
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepo
    ) {}

    public function execute(int $id)
    {
        return $this->appointmentRepo->delete($id);
    }
}
