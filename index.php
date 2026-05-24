<?php

require_once __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use App\Payments\MpesaCallbackHandler; // Assuming you have a handler class here

/**
 * Cloud Function Entry Point
 * 
 * @param ServerRequestInterface $request
 * @return string
 */
function mpesaCallback(ServerRequestInterface $request): string {
    // 1. Security Validation
    $params = $request->getQueryParams();
    $providedToken = $params['token'] ?? '';
    $expectedToken = getenv('CALLBACK_SECRET');

    if (empty($expectedToken) || !hash_equals($expectedToken, $providedToken)) {
        header('Content-Type: application/json', true, 403);
        return json_encode(["status" => "error", "message" => "Unauthorized"]);
    }

    // 2. Delegate to your existing Payment Namespace
    // This allows you to use your existing logic in src/Payments/
    $payload = (string)$request->getBody();
    
    // Example: Assuming you have a class to handle the actual database/business logic
    // $handler = new MpesaCallbackHandler();
    // $handler->process($payload);
    
    // Log the receipt for debugging
    error_log("M-Pesa Callback received: " . $payload);

    // 3. Mandatory Acknowledgment for Daraja
    header('Content-Type: application/json', true, 200);
    return json_encode([
        "ResultCode" => 0,
        "ResultDesc" => "Service accepted successfully"
    ]);
}
