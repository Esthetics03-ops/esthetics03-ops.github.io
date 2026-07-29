/**
 * The Esthetics Hub - Automated Front-End Client Bridge
 * Automatically injects live event handlers into esthetics03-ops.github.io
 */

const ENGINE_ENDPOINT = "https://YOUR-DEPLOYED-BACKEND-URL.vercel.app/api/sync-engine"; // Replace with your live Vercel/Netlify URL

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Esthetics Hub] Initializing Automated Master Bridge...");
  syncLiveTelemetry();
  bindPaymentEngine();
});

async function syncLiveTelemetry() {
  try {
    const res = await fetch(`${ENGINE_ENDPOINT}?action=system_status`);
    const data = await res.json();
    console.log("[Master Hub Sync OK]:", data);
  } catch (e) {
    console.warn("[Telemetry] Operating in local sync fallback mode.");
  }
}

function bindPaymentEngine() {
  // Automatically locates your M-Pesa STK Push Submit button based on live DOM scan
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.textContent.includes("Send Payment Prompt")) {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        // Locate the phone input field dynamically
        const phoneInput = document.querySelector("input[type='text'], input[type='tel']");
        const phone = phoneInput ? phoneInput.value.trim() : "";

        if (!phone || phone.length < 9) {
          alert("Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX)");
          return;
        }

        const originalText = btn.textContent;
        btn.textContent = "Connecting to MindSync Pay...";
        btn.disabled = true;

        try {
          const response = await fetch(ENGINE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "trigger_stk", phone: phone, amount: "1000" })
          });

          const result = await response.json();
          if (result.success) {
            alert(`Success! ${result.message}\nRef: ${result.transactionId}`);
          } else {
            alert(`Transaction Failed: ${result.error}`);
          }
        } catch (err) {
          alert("Network error communicating with the payment gateway.");
        } finally {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      });
    }
  });
            }
