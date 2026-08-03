/**
 * The Esthetics Hub - Master Client Connector (v24.0.0)
 * Connected to Live Render Backend
 */

// Replace with your live Render service URL once provisioning completes
const RENDER_BACKEND_URL = "https://your-service-name.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Esthetics Hub] Initializing Live Master Client Bridge...");
  syncLiveTelemetry();
  bindPaymentEngine();
});

async function syncLiveTelemetry() {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/api/sync-engine?action=system_status`);
    const data = await response.json();
    console.log("[Master Hub Telemetry Connected]:", data);
  } catch (err) {
    console.warn("[Telemetry Notice] Operating in offline fallback mode:", err);
  }
}

function bindPaymentEngine() {
  const buttons = document.querySelectorAll("button");
  
  buttons.forEach(btn => {
    if (btn.textContent.includes("Send Payment Prompt")) {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const phoneInput = document.querySelector("input[type='text'], input[type='tel']");
        const phone = phoneInput ? phoneInput.value.trim() : "";

        if (!phone || phone.length < 9) {
          alert("⚠️ Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX)");
          return;
        }

        const originalText = btn.textContent;
        btn.textContent = "Connecting to MindSync Pay...";
        btn.disabled = true;

        try {
          const res = await fetch(`${RENDER_BACKEND_URL}/api/sync-engine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "trigger_stk", 
              phone: phone, 
              amount: "1000" 
            })
          });

          const result = await res.json();
          
          if (result.success) {
            alert(`✨ Success! ${result.message}\nTransaction Reference: ${result.transactionId}`);
          } else {
            alert(`❌ Transaction Failed: ${result.error || "Unknown server error"}`);
          }
        } catch (err) {
          console.error("Payment Gateway Error:", err);
          alert("🌐 Network error communicating with the MindSync Pay gateway.");
        } finally {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      });
    }
  });
      }
