<?php

namespace App\Domains\Auth\Infrastructure\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationKeyMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $keyCode
    ) {}

    public function build()
    {
        return $this->subject('Welcome to TruFit - Your Registration Key')
                    ->html("
                        <h1>Welcome to the Team, {$this->name}!</h1>
                        <p>An administrator has created an onboarding profile for you.</p>
                        <p>Please use the following registration key to create your SQS Portal account:</p>
                        <h2 style='letter-spacing: 2px; color: #1e3a8a; background: #f3f4f6; padding: 10px; display: inline-block;'>{$this->keyCode}</h2>
                        <p>Simply go to the login page, click <strong>'Register a New Account'</strong>, and enter this key.</p>
                        <p>This key will expire in 7 days.</p>
                        <p>If you have any questions, please contact your supervisor.</p>
                    ");
    }
}