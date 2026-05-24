<?php
require_once __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;

function mpesaCallback(ServerRequestInterface $request): string {
    // 1. Validate Secret Token
    $params = $request->getQueryParams();
    $providedToken = $params['token'] ?? '';
    $expectedToken = getenv('CALLBACK_SECRET');

    if (empty($expectedToken) || $providedToken !== $expectedToken) {
        header('Content-Type: application/json', true, 403);
        return json_encode(["error" => "Unauthorized"]);
    }

    // 2. Process Payload
    $data = (string)$request->getBody();
    
    // Log to Google Cloud Logging (Standard Output)
    error_log("M-Pesa Callback Received: " . $data);

    // 3. Immediate Acknowledgment
    header('Content-Type: application/json', true, 200);
    return json_encode([
        "ResultCode" => 0,
        "ResultDesc" => "Service accepted successfully"
    ]);
}
