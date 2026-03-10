<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\GetAuthenticatedUser;
use App\Domains\Auth\Application\UseCases\ForgotPassword;
use App\Domains\Auth\Application\UseCases\ResetPassword;
use App\Domains\Auth\Http\Requests\ForgotPasswordRequest;
use App\Domains\Auth\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\Request;

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
        $result = $this->getAuthenticatedUser->execute($request);
        return response()->json($result);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $result = $this->forgotPassword->execute($request->validated('email'));
        return response()->json($result);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $result = $this->resetPassword->execute(
            $request->validated('email'),
            $request->validated('code'),
            $request->validated('password')
        );
        return response()->json($result);
    }
}