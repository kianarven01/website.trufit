<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\UpdateProfile;
use App\Domains\Auth\Application\UseCases\UpdatePassword;
use App\Domains\Auth\Application\UseCases\UpdateEmail;
use App\Domains\Auth\Application\UseCases\SendVerificationCode;
use App\Domains\Auth\Application\UseCases\VerifyEmail;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected $updateProfile;
    protected $updatePassword;
    protected $updateEmail;
    protected $sendVerificationCode;
    protected $verifyEmail;

    public function __construct(
        UpdateProfile $updateProfile,
        UpdatePassword $updatePassword,
        UpdateEmail $updateEmail,
        SendVerificationCode $sendVerificationCode,
        VerifyEmail $verifyEmail
    ) {
        $this->updateProfile = $updateProfile;
        $this->updatePassword = $updatePassword;
        $this->updateEmail = $updateEmail;
        $this->sendVerificationCode = $sendVerificationCode;
        $this->verifyEmail = $verifyEmail;
    }

    public function update(Request $request)
    {
        $result = $this->updateProfile->execute($request);
        return response()->json($result);
    }

    public function changePassword(Request $request)
    {
        $result = $this->updatePassword->execute($request);
        return response()->json($result);
    }

    public function updateEmail(Request $request)
    {
        $result = $this->updateEmail->execute($request);
        return response()->json($result);
    }

    public function resendVerificationCode(Request $request)
    {
        $result = $this->sendVerificationCode->execute($request);
        return response()->json($result);
    }

    public function verifyEmail(Request $request)
    {
        $result = $this->verifyEmail->execute($request);
        return response()->json($result);
    }
}