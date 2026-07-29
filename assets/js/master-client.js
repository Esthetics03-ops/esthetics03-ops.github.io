/**
 * The Esthetics Hub - Front-End Master Client Connector
 * Connects UI elements to the serverless backend engine.
 */

const BACKEND_ENDPOINT = "https://your-serverless-project.vercel.app/api/sync-engine"; // Update with your deployed URL

document.addEventListener("DOMContentLoaded", () => {
  initSystemMetrics();
  initMpesaHandler();
});

// Fetch and display live system telemetry
async function initSystemMetrics() {
  try {
    const response = await fetch(`${BACKEND_ENDPOINT}?action=system_status`);
    const data = await response.json();
    console.log("Master Hub Sync Status:", data);
  } catch (err) {
    console.warn("Operating in offline telemetry mode:", err);
  }
}

// Wire up the M-Pesa STK Push Form
function initMpesaHandler() {
  const payButton = document.querySelector("button, input[type='submit']"); // Target your payment button
  // Alternatively, target by a specific ID if you add id="stk-trigger" to your button
  
  const paymentSection = document.querySelector(".Bio-Sync Premium") || document.body;

  // Listen for custom payment trigger clicks
  document.addEventListener("click async", async (e) => {
    if (e.target && e.target.textContent.includes("Send Payment Prompt")) {
      e.preventDefault();
      
      const phoneInput = document.querySelector("input[type='text'], input[type='tel']");
      const phone = phoneInput ? phoneInput.value : "";
      const amount = "1000"; // Or grab dynamically from input

      if (!phone) {
        alert("Please enter a valid M-Pesa phone number (254...)");
        return;
      }

      e.target.textContent = "Sending STK Push...";
      
      try {
        const res = await fetch(BACKEND_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "trigger_stk", phone, amount })
        });
        
        const result = await res.json();
        if (result.success) {
          alert(`STK Push sent successfully! Check your phone (${phone}). Transaction ID: ${result.transactionId}`);
          e.target.textContent = "Send Payment Prompt";
        } else {
          alert(`Payment Error: ${result.error}`);
          e.target.textContent = "Send Payment Prompt";
        }
      } catch (err) {
        alert("Network connection error connecting to MindSync Pay gateway.");
        e.target.textContent = "Send Payment Prompt";
      }
    }
  });
    }
