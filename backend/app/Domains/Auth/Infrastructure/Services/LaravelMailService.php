<?php

namespace App\Domains\Auth\Infrastructure\Services;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Infrastructure\Mail\VerificationCodeMail;
use App\Domains\Auth\Infrastructure\Mail\RegistrationKeyMail;
use Illuminate\Support\Facades\Mail;
use Resend\Resend;

class LaravelMailService implements MailServiceInterface
{
    /**
     * Send the verification code email.
     */
    public function sendVerificationCode(string $email, string $code, string $name): void
    {
        // If Resend API key is present and mailer is set to resend, use direct API
        if (config('mail.default') === 'resend' && config('services.resend.key')) {
            $resend = Resend::client(config('services.resend.key'));
            
            $mailable = new VerificationCodeMail($code, $name);
            $htmlContent = $mailable->render();

            $resend->emails->send([
                'from' => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to' => [$email],
                'subject' => 'Your Verification Code',
                'html' => (string) $htmlContent,
            ]);
            return;
        }

        Mail::to($email)->send(new VerificationCodeMail($code, $name));
    }

    /**
     * Send the registration key email.
     */
    public function sendRegistrationKey(string $email, string $keyCode, string $name): void
    {
        if (config('mail.default') === 'resend' && config('services.resend.key')) {
            $resend = Resend::client(config('services.resend.key'));
            
            $mailable = new RegistrationKeyMail($name, $keyCode);
            $htmlContent = $mailable->render();

            $resend->emails->send([
                'from' => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to' => [$email],
                'subject' => 'Your Registration Key',
                'html' => (string) $htmlContent,
            ]);
            return;
        }

        Mail::to($email)->send(new RegistrationKeyMail($name, $keyCode));
    }
}
