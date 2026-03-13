<?php

namespace App\Domains\Auth\Infrastructure\Services;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Infrastructure\Mail\VerificationCodeMail;
use App\Domains\Auth\Infrastructure\Mail\RegistrationKeyMail;
use Illuminate\Support\Facades\Mail;

class LaravelMailService implements MailServiceInterface
{
    public function sendVerificationCode(string $email, string $code, string $name): void
    {
        Mail::to($email)->send(new VerificationCodeMail($code, $name));
    }

    public function sendRegistrationKey(string $email, string $keyCode, string $name): void
    {
        Mail::to($email)->send(new RegistrationKeyMail($name, $keyCode));
    }
}