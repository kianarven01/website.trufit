<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\UpdateProfile;
use App\Domains\Auth\Application\UseCases\UpdatePassword;
use App\Domains\Auth\Application\UseCases\UpdateEmail;
use App\Domains\Auth\Application\UseCases\SendVerificationCode;
use App\Domains\Auth\Application\UseCases\VerifyEmail;
use Illuminate\Http\Request;

use App\Domains\Auth\Http\Requests\UpdateProfileRequest;
use App\Domains\Auth\Http\Requests\UpdatePasswordRequest;
use App\Domains\Auth\Http\Requests\UpdateEmailRequest;
use App\Domains\Auth\Http\Requests\VerifyEmailRequest;
use App\Domains\Auth\Application\DTOs\UpdateProfileDTO;

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

    public function update(UpdateProfileRequest $request)
    {
        $dto = UpdateProfileDTO::fromRequest($request);
        $result = $this->updateProfile->execute($request->user(), $dto);
        return response()->json($result);
    }

    public function changePassword(UpdatePasswordRequest $request)
    {
        $result = $this->updatePassword->execute(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password')
        );
        return response()->json($result);
    }

    public function updateEmail(UpdateEmailRequest $request)
    {
        $result = $this->updateEmail->execute(
            $request->user(),
            $request->validated('email')
        );
        return response()->json($result);
    }

    public function resendVerificationCode(Request $request)
    {
        $result = $this->sendVerificationCode->execute($request->user());
        return response()->json($result);
    }

    public function verifyEmail(VerifyEmailRequest $request)
    {
        $result = $this->verifyEmail->execute(
            $request->user(),
            $request->validated('code')
        );
        return response()->json($result);
    }
}