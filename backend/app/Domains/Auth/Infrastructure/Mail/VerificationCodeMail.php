<?php

namespace App\Domains\Auth\Infrastructure\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $name;

    public function __construct($code, $name)
    {
        $this->code = $code;
        $this->name = $name;
    }

    public function build()
    {
        return $this->subject('Your Verification Code')
                    ->html("
                        <h1>Email Verification</h1>
                        <p>Hello {$this->name},</p>
                        <p>Your 6-digit verification code is:</p>
                        <h2 style='letter-spacing: 5px; color: #2563eb;'>{$this->code}</h2>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you did not request this code, please ignore this email.</p>
                    ");
    }
}