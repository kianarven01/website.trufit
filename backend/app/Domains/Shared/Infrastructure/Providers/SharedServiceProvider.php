<?php

namespace App\Domains\Shared\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
use Resend\Resend;
use Illuminate\Mail\Transport\GenericTransport;

class SharedServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // For Laravel 12, we register a simple bridge if MAIL_MAILER=resend
        // Since the official symfony bridge might have conflicts, we'll
        // let the LaravelMailService handle the direct API calls for now
        // as implemented. This provider is here for future global extensions.
    }
}
