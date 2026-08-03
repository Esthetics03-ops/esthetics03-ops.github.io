<?php
/**
 * M-Pesa Callback Handler - Google Cloud Run
 * Entry point for M-Pesa payment callbacks
 */

require_once __DIR__ . '/vendor/autoload.php';

use Functions\CloudEvents\CloudEventFunctionInterface;
use Psr\Http\Message\ServerRequestInterface;

class MpesaCallback implements CloudEventFunctionInterface
{
    /**
     * Handle M-Pesa callback from Safaricom
     */
    public function __invoke(ServerRequestInterface $request): void
    {
        try {
            // Get request body
            $body = (string)$request->getBody();
            $data = json_decode($body, true);

            // Validate callback signature
            $this->validateCallback($data, $request);

            // Log incoming callback
            error_log('M-Pesa Callback received: ' . json_encode($data));

            // Process callback
            $this->processCallback($data);

            // Return success response
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Callback processed']);

        } catch (Exception $e) {
            error_log('Callback Error: ' . $e->getMessage());
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Validate callback authenticity
     */
    private function validateCallback($data, ServerRequestInterface $request): void
    {
        $secret = getenv('CALLBACK_SECRET');
        
        if (empty($secret)) {
            throw new Exception('CALLBACK_SECRET not configured');
        }

        // Verify signature if provided
        if ($request->hasHeader('X-Signature')) {
            $signature = $request->getHeader('X-Signature')[0];
            $payload = (string)$request->getBody();
            
            $expectedSignature = hash_hmac('sha256', $payload, $secret, true);
            $expectedSignatureB64 = base64_encode($expectedSignature);
            
            if ($signature !== $expectedSignatureB64) {
                throw new Exception('Invalid callback signature');
            }
        }

        // Verify required fields
        $requiredFields = ['Body', 'Head'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
    }

    /**
     * Process M-Pesa callback data
     */
    private function processCallback($data): void
    {
        $body = $data['Body'] ?? [];
        $stkCallback = $body['stkCallback'] ?? null;

        if (!$stkCallback) {
            throw new Exception('Invalid callback structure');
        }

        $merchantRequestID = $stkCallback['MerchantRequestID'] ?? null;
        $checkoutRequestID = $stkCallback['CheckoutRequestID'] ?? null;
        $resultCode = $stkCallback['ResultCode'] ?? null;
        $resultDesc = $stkCallback['ResultDesc'] ?? null;

        // Prepare callback data
        $callbackData = [
            'merchantRequestID' => $merchantRequestID,
            'checkoutRequestID' => $checkoutRequestID,
            'resultCode' => $resultCode,
            'resultDesc' => $resultDesc,
            'timestamp' => date('Y-m-d H:i:s'),
            'receivedAt' => time(),
        ];

        // If successful (ResultCode == 0), extract payment details
        if ($resultCode == 0 && isset($stkCallback['CallbackMetadata'])) {
            $metadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            
            foreach ($metadata as $item) {
                $name = $item['Name'] ?? null;
                $value = $item['Value'] ?? null;

                switch ($name) {
                    case 'Amount':
                        $callbackData['amount'] = $value;
                        break;
                    case 'MpesaReceiptNumber':
                        $callbackData['mpesaReceiptNumber'] = $value;
                        break;
                    case 'TransactionDate':
                        $callbackData['transactionDate'] = $value;
                        break;
                    case 'PhoneNumber':
                        $callbackData['phoneNumber'] = $value;
                        break;
                }
            }
        }

        // Store callback data
        $this->storeCallback($callbackData);

        // Send notification (optional)
        $this->notifyWebhook($callbackData);
    }

    /**
     * Store callback data in database or file
     */
    private function storeCallback($data): void
    {
        // Example: Store in Google Firestore
        try {
            $firestoreClient = new Google\Cloud\Firestore\FirestoreClient();
            
            $docRef = $firestoreClient
                ->collection('mpesa_callbacks')
                ->document($data['checkoutRequestID'] ?? uniqid());

            $docRef->set($data);

            error_log('Callback stored: ' . $data['checkoutRequestID']);
        } catch (Exception $e) {
            error_log('Firestore storage failed: ' . $e->getMessage());
            // Fallback: Store in Cloud Logging
            error_log('Callback data: ' . json_encode($data));
        }
    }

    /**
     * Send notification to webhook endpoint
     */
    private function notifyWebhook($data): void
    {
        $webhookUrl = getenv('WEBHOOK_URL');
        
        if (empty($webhookUrl)) {
            return;
        }

        try {
            $client = new \GuzzleHttp\Client();
            
            $client->post($webhookUrl, [
                'json' => $data,
                'timeout' => 10,
                'headers' => [
                    'X-Callback-Token' => hash_hmac('sha256', json_encode($data), getenv('CALLBACK_SECRET')),
                ],
            ]);

            error_log('Webhook notification sent');
        } catch (Exception $e) {
            error_log('Webhook notification failed: ' . $e->getMessage());
        }
    }
}

return new MpesaCallback();
