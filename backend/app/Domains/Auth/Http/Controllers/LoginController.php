<?php

// app/Domains/Auth/Http/Controllers/LoginController.php
namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Requests\LoginRequest;
use App\Domains\Auth\Application\DTOs\LoginDTO;
use App\Domains\Auth\Application\UseCases\AuthenticateUser;

class LoginController extends Controller
{
    public function __construct(protected AuthenticateUser $authUseCase) {}

    public function __invoke(LoginRequest $request)
    {
        $dto = LoginDTO::fromRequest($request);
        $result = $this->authUseCase->execute($dto);

        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    }
}