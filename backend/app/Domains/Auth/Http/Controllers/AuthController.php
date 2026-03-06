<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Application\UseCases\GetAuthenticatedUser;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected $getAuthenticatedUser;

    public function __construct(GetAuthenticatedUser $getAuthenticatedUser)
    {
        $this->getAuthenticatedUser = $getAuthenticatedUser;
    }

    public function verify(Request $request)
    {
        $result = $this->getAuthenticatedUser->execute($request);
        return response()->json($result);
    }
}