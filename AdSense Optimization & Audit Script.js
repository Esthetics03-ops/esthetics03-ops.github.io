/**
 * AdSense Account Health & Settings Auditor
 * Target: The Esthetics Hub (esthetics03-ops.github.io)
 * Purpose: Ensure ads.txt is verified and reporting is synced.
 */

function auditAdSenseSettings() {
  try {
    // 1. Fetch your AdSense Account
    const accounts = AdSense.Accounts.list();
    if (!accounts.account) {
      Logger.log("No AdSense account found. Please check your login.");
      return;
    }

    const accountId = accounts.account[0].name; // Gets your pub-1959507280210179 ID
    Logger.log("Checking Account: " + accountId);

    // 2. Check Site Status (ads.txt Verification)
    const sites = AdSense.Accounts.Sites.list(accountId);
    sites.sites.forEach(site => {
      Logger.log("Site: " + site.domain + " | Status: " + site.state);
      
      if (site.domain === "esthetics03-ops.github.io" && site.state !== "READY") {
        Logger.log("ALERT: Site is not fully ready. Check ads.txt or site ownership.");
      }
    });

    // 3. Audit Ad Units for "The Esthetics Hub"
    const adClients = AdSense.Accounts.Adclients.list(accountId);
    adClients.adClients.forEach(client => {
      const adUnits = AdSense.Accounts.Adclients.Adunits.list(accountId, client.name);
      if (adUnits.adUnits) {
        adUnits.adUnits.forEach(unit => {
          Logger.log("Ad Unit Active: " + unit.displayName + " | Type: " + unit.type);
        });
      }
    });

    // 4. Check for Payment Holds (Critical for your $30 debt resolution)
    const accountDetails = AdSense.Accounts.get(accountId);
    if (accountDetails.pendingTasks) {
       Logger.log("Pending Tasks Found: " + accountDetails.pendingTasks.join(", "));
    }

    Logger.log("Audit Complete. If status is READY, your $884.53 revenue is safe for payout.");

  } catch (e) {
    Logger.log("Error: " + e.message);
  }
                        }
