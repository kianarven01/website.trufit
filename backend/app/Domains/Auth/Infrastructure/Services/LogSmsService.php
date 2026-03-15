<?php

namespace App\Domains\Auth\Infrastructure\Services;

use App\Domains\Auth\Domain\Services\SmsServiceInterface;
use Illuminate\Support\Facades\Log;

class LogSmsService implements SmsServiceInterface
{
    public function sendVerificationCode(string $phone, string $code): void
    {
        // For development, we just log the SMS content.
        // In production, you would integrate Twilio, Vonage, etc.
        Log::info("SMS Verification Code for {$phone}: Your 6-digit code is {$code}");
    }
}