<?php
namespace App\Domains\Auth\Application\UseCases;

use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;

class GetAuthenticatedUser
{
    public function execute(Request $request): array
    {
        $user = $request->user();

        // You can add logic here in the future:
        // if ($user->is_suspended) { throw new Exception('Account suspended'); }

        return [
            'status' => 'success',
            'data' => [
                'user' => new UserResource($user)
            ]
        ];
    }
}