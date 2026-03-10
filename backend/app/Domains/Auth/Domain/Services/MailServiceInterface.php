<?php

namespace App\Domains\Auth\Domain\Services;

interface MailServiceInterface
{
    /**
     * Send a verification code to a recipient.
     *
     * @param string $email
     * @param string $code
     * @param string $name
     * @return void
     */
    public function sendVerificationCode(string $email, string $code, string $name): void;
}