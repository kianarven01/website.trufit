<?php

namespace App\Domains\Auth\Infrastructure\Services;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Infrastructure\Mail\VerificationCodeMail;
use App\Domains\Auth\Infrastructure\Mail\RegistrationKeyMail;
use Illuminate\Support\Facades\Mail;

class LaravelMailService implements MailServiceInterface
{
    /**
     * Send the verification code email.
     *
     * When MAIL_MAILER=resend, Laravel's built-in Resend transport
     * handles the API integration automatically.
     */
    public function sendVerificationCode(string $email, string $code, string $name): void
    {
        Mail::to($email)->send(new VerificationCodeMail($code, $name));
    }

    /**
     * Send the registration key email.
     */
    public function sendRegistrationKey(string $email, string $keyCode, string $name): void
    {
        Mail::to($email)->send(new RegistrationKeyMail($name, $keyCode));
    }
}
