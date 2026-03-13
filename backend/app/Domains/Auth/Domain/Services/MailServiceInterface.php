<?php

namespace App\Domains\Auth\Domain\Services;

interface MailServiceInterface
{
    public function sendVerificationCode(string $email, string $code, string $name): void;
    public function sendRegistrationKey(string $email, string $keyCode, string $name): void;
}