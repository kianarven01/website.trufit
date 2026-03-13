<?php

// app/Domains/Auth/Http/Controllers/LoginController.php
namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Requests\LoginRequest;
use App\Domains\Auth\Http\Requests\VerifyLoginChallengeRequest;
use App\Domains\Auth\Application\DTOs\LoginDTO;
use App\Domains\Auth\Application\UseCases\AuthenticateUser;
use App\Domains\Auth\Application\UseCases\VerifyLoginChallenge;
use App\Domains\Auth\Exceptions\AuthDomainException;

class LoginController extends Controller
{
    public function __construct(
        protected AuthenticateUser $authUseCase,
        protected VerifyLoginChallenge $verifyChallengeUseCase
    ) {}

    public function login(LoginRequest $request)
    {
        try {
            $dto = LoginDTO::fromRequest($request);
            $result = $this->authUseCase->execute($dto);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 401);
        }
    }

    public function verifyChallenge(VerifyLoginChallengeRequest $request)
    {
        try {
            $result = $this->verifyChallengeUseCase->execute(
                $request->validated('username'),
                $request->validated('code'),
                $request->boolean('remember')
            );

            return response()->json($result);
        } catch (AuthDomainException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], $e->getStatusCode());
        }
    }
}