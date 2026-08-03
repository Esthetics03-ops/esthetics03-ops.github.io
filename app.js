const BACKEND_URL = "https://your-backend-bridge.vercel.app/api/mpesa"; 

async function triggerMpesaPayment() {
    const phone = document.getElementById('phone-number').value;
    const amount = document.getElementById('amount').value;
    const statusText = document.getElementById('payment-status');
    
    if(!phone || !amount) {
        statusText.innerText = "Please fill in all fields.";
        return;
    }

    statusText.innerText = "Sending STK Push... Check your phone.";

    try {
        // 1. Initiate STK Push via your Backend Bridge
        const response = await fetch(`${BACKEND_URL}/stkpush`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, amount })
        });
        
        const data = await response.json();
        
        if (data.CheckoutRequestID) {
            statusText.innerText = "Prompt sent! Waiting for your PIN...";
            // 2. Start polling your backend to see when user enters PIN
            checkPaymentStatus(data.CheckoutRequestID);
        } else {
            statusText.innerText = "Failed to initiate payment. Try again.";
        }
    } catch (error) {
        statusText.innerText = "Connection error.";
        console.error(error);
    }
}

async function checkPaymentStatus(checkoutRequestID) {
    const statusText = document.getElementById('payment-status');
    let attempts = 0;
    
    const interval = setInterval(async () => {
        attempts++;
        if(attempts > 12) { // Stop polling after 2 minutes (12 * 10 seconds)
            clearInterval(interval);
            statusText.innerText = "Payment verification timed out.";
            return;
        }

        const res = await fetch(`${BACKEND_URL}/verify/${checkoutRequestID}`);
        const paymentResult = await res.json();

        if (paymentResult.status === 'SUCCESS') {
            clearInterval(interval);
            // 3. REVEAL THE PAYWALL
            document.getElementById('mpesa-form-container').style.display = 'none';
            document.getElementById('premium-protocol-content').style.display = 'block';
        } else if (paymentResult.status === 'FAILED') {
            clearInterval(interval);
            statusText.innerText = "Transaction cancelled or failed.";
        }
    }, 10000); // Check every 10 seconds
}
