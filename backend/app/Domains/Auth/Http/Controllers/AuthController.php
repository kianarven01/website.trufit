<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\GetAuthenticatedUser;
use App\Domains\Auth\Application\UseCases\ForgotPassword;
use App\Domains\Auth\Application\UseCases\ResetPassword;
use App\Domains\Auth\Http\Requests\ForgotPasswordRequest;
use App\Domains\Auth\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\Request;

use App\Domains\Auth\Exceptions\AuthDomainException;

class AuthController extends Controller
{
    protected $getAuthenticatedUser;
    protected $forgotPassword;
    protected $resetPassword;

    public function __construct(
        GetAuthenticatedUser $getAuthenticatedUser,
        ForgotPassword $forgotPassword,
        ResetPassword $resetPassword
    ) {
        $this->getAuthenticatedUser = $getAuthenticatedUser;
        $this->forgotPassword = $forgotPassword;
        $this->resetPassword = $resetPassword;
    }

    public function verify(Request $request)
    {
        try {
            $result = $this->getAuthenticatedUser->execute($request);
            return response()->json($result);
        } catch (AuthDomainException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], $e->getStatusCode());
        }
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        try {
            $result = $this->forgotPassword->execute($request->validated('email'));
            return response()->json($result);
        } catch (AuthDomainException $e) {
            $status = ($e instanceof \App\Domains\Auth\Exceptions\UnverifiedAccountException) ? 'unverified' : 'error';
            return response()->json(['status' => $status, 'message' => $e->getMessage()], $e->getStatusCode());
        }
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $result = $this->resetPassword->execute(
                $request->validated('email'),
                $request->validated('code'),
                $request->validated('password')
            );
            return response()->json($result);
        } catch (AuthDomainException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], $e->getStatusCode());
        }
    }
}