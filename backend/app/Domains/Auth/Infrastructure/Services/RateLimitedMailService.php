<?php

namespace App\Domains\Auth\Infrastructure\Services;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Exceptions\MailRateLimitExceededException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Decorator that wraps any MailServiceInterface implementation
 * with daily and monthly send-count limits.
 *
 * Uses Laravel's database-backed cache to track counters.
 * Designed to keep Resend usage within free-tier limits.
 */
class RateLimitedMailService implements MailServiceInterface
{
    private const CACHE_KEY_DAILY  = 'mail:daily_count';
    private const CACHE_KEY_MONTHLY = 'mail:monthly_count';

    public function __construct(
        private readonly MailServiceInterface $inner,
        private readonly int $dailyLimit = 80,
        private readonly int $monthlyLimit = 2500,
    ) {}

    public function sendVerificationCode(string $email, string $code, string $name): void
    {
        $this->guardRateLimit();
        $this->inner->sendVerificationCode($email, $code, $name);
        $this->incrementCounters();
    }

    public function sendRegistrationKey(string $email, string $keyCode, string $name): void
    {
        $this->guardRateLimit();
        $this->inner->sendRegistrationKey($email, $keyCode, $name);
        $this->incrementCounters();
    }

    /**
     * Check if sending another email would exceed either limit.
     *
     * @throws MailRateLimitExceededException
     */
    private function guardRateLimit(): void
    {
        $dailyCount  = (int) Cache::get(self::CACHE_KEY_DAILY, 0);
        $monthlyCount = (int) Cache::get(self::CACHE_KEY_MONTHLY, 0);

        if ($dailyCount >= $this->dailyLimit) {
            Log::warning('Mail daily rate limit reached', [
                'daily_count' => $dailyCount,
                'daily_limit' => $this->dailyLimit,
            ]);
            throw new MailRateLimitExceededException('daily');
        }

        if ($monthlyCount >= $this->monthlyLimit) {
            Log::warning('Mail monthly rate limit reached', [
                'monthly_count' => $monthlyCount,
                'monthly_limit' => $this->monthlyLimit,
            ]);
            throw new MailRateLimitExceededException('monthly');
        }
    }

    /**
     * Increment both counters after a successful send.
     *
     * Daily counter expires after 24 hours.
     * Monthly counter expires after 30 days.
     */
    private function incrementCounters(): void
    {
        // Daily: expires at end of 24h window
        if (Cache::has(self::CACHE_KEY_DAILY)) {
            Cache::increment(self::CACHE_KEY_DAILY);
        } else {
            Cache::put(self::CACHE_KEY_DAILY, 1, now()->addHours(24));
        }

        // Monthly: expires at end of 30-day window
        if (Cache::has(self::CACHE_KEY_MONTHLY)) {
            Cache::increment(self::CACHE_KEY_MONTHLY);
        } else {
            Cache::put(self::CACHE_KEY_MONTHLY, 1, now()->addDays(30));
        }

        Log::info('Mail sent', [
            'daily_count'   => Cache::get(self::CACHE_KEY_DAILY),
            'monthly_count' => Cache::get(self::CACHE_KEY_MONTHLY),
        ]);
    }
}
