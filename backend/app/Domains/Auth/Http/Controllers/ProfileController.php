<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\UpdateProfile;
use App\Domains\Auth\Application\UseCases\UpdatePassword;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected $updateProfile;
    protected $updatePassword;

    public function __construct(
        UpdateProfile $updateProfile,
        UpdatePassword $updatePassword
    ) {
        $this->updateProfile = $updateProfile;
        $this->updatePassword = $updatePassword;
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
}