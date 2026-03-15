<?php

namespace App\Domains\Audit\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Audit\Application\UseCases\ListAuditLogs;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request, ListAuditLogs $useCase)
    {
        return $useCase->execute($request->query('per_page', 50));
    }
}