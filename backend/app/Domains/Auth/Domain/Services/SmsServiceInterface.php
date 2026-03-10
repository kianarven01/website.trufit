<?php

namespace App\Domains\Auth\Domain\Services;

interface SmsServiceInterface
{
    /**
     * Send a verification code to a phone number.
     *
     * @param string $phone
     * @param string $code
     * @return void
     */
    public function sendVerificationCode(string $phone, string $code): void;
}