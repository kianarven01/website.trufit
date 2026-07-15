<?php

namespace App\Domains\SalesOrder\Http\Controllers\Traits;

use Illuminate\Http\JsonResponse;
use RuntimeException;
use Throwable;

trait HandlesUseCaseErrors
{
    protected function handleUseCaseException(Throwable $e, string $actionLabel): JsonResponse
    {
        if ($e instanceof RuntimeException) {
            $code = $e->getCode();
            $statusCode = is_numeric($code) && $code >= 100 && $code < 600 ? (int) $code : 400;

            return response()->json([
                'message' => $e->getMessage(),
            ], $statusCode);
        }

        return response()->json([
            'message' => "Failed to {$actionLabel}.",
            'error' => $e->getMessage(),
        ], 500);
    }

    protected function clampPerPage(mixed $perPage, int $default = 10, int $max = 100): int
    {
        return max(1, min((int) $perPage ?: $default, $max));
    }
}
