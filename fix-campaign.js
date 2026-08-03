/**
 * Google Ads Asset Diagnostic & Auto-Fix Script
 * Ready for deployment inside 'esthetics-api' or 'revenue-dashboard'
 */

// Load environment variables if running locally (optional fallback)
require('dotenv').config({ silent: true });
const { GoogleAdsApi, enums } = require("@google-ads/google-ads-api");

// 1. Initialize Client Security Architecture
const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

// Configure constants from environment parameters
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || "YOUR_CUSTOMER_ID_NO_DASHES";
const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || "YOUR_CAMPAIGN_ID";
const ASSET_GROUP_ID = process.env.GOOGLE_ADS_ASSET_GROUP_ID || "YOUR_ASSET_GROUP_ID";

const customer = client.Customer({
  customer_id: CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function runDiagnosticAndBypass() {
  console.log(`[+] Initializing verification pipeline for Campaign: ${CAMPAIGN_ID}...`);

  try {
    // ==========================================
    // PHASE 1: DIAGNOSTIC AUDIT
    // ==========================================
    const query = `
      SELECT 
        campaign.id, 
        campaign.status, 
        campaign.advertising_channel_type
      FROM campaign 
      WHERE campaign.id = ${CAMPAIGN_ID}
    `;
    
    const [campaignResult] = await customer.query(query);
    if (!campaignResult) {
      throw new Error(`Target Campaign ID ${CAMPAIGN_ID} was not found in account ${CUSTOMER_ID}.`);
    }

    console.log(`[Diagnostic] Channel Type: ${campaignResult.campaign.advertising_channel_type}`);
    console.log(`[Diagnostic] Current Sync Status: ${campaignResult.campaign.status}`);

    // ==========================================
    // PHASE 2: INJECT MANDATORY TEXT ASSETS
    // ==========================================
    console.log("\n[+] Creating backend assets to resolve missing required fields...");

    // 1. Provision a Headline Asset
    const headlineOp = {
      create: {
        text_asset: { text: "Premium Wellness Platforms" }
      }
    };
    const headlineRes = await customer.assets.mutate([headlineOp]);
    const headlineAssetResource = headlineRes.results[0].resource_name;

    // 2. Provision a Long Headline Asset
    const longHeadlineOp = {
      create: {
        text_asset: { text: "Custom AI-Integrated Sites for Wellness & Tech Brands" }
      }
    };
    const longHeadlineRes = await customer.assets.mutate([longHeadlineOp]);
    const longHeadlineAssetResource = longHeadlineRes.results[0].resource_name;

    // 3. Link newly generated assets into your existing Asset Group container
    console.log(`[+] Attaching text mutations directly to Asset Group: ${ASSET_GROUP_ID}...`);
    
    const assetGroupAssetOps = [
      {
        create: {
          asset_group: `customers/${CUSTOMER_ID}/assetGroups/${ASSET_GROUP_ID}`,
          asset: headlineAssetResource,
          field_type: enums.AssetFieldType.HEADLINE
        }
      },
      {
        create: {
          asset_group: `customers/${CUSTOMER_ID}/assetGroups/${ASSET_GROUP_ID}`,
          asset: longHeadlineAssetResource,
          field_type: enums.AssetFieldType.LONG_HEADLINE
        }
      }
    ];

    await customer.assetGroupAssets.mutate(assetGroupAssetOps);
    console.log("[Fix] Baseline text parameters attached successfully.");

    // ==========================================
    // PHASE 3: FORCE RE-VALIDATION & STATE BYPASS
    // ==========================================
    console.log("\n[+] Mutating system state workflow out of dynamic draft status...");
    
    const campaignOperation = {
      update: {
        resource_name: `customers/${CUSTOMER_ID}/campaigns/${CAMPAIGN_ID}`,
        status: enums.CampaignStatus.ENABLED, 
      },
      update_mask: "status",
    };

    const bypassResponse = await customer.campaigns.mutate([campaignOperation]);
    
    console.log("\n====================================================");
    console.log("🎉 SUCCESS: Campaign verification engine complete!");
    console.log(`Mutated Resource Path: ${bypassResponse.results[0].resource_name}`);
    console.log("Status: ENABLED & synced to review processing pipeline.");
    console.log("====================================================\n");

  } catch (error) {
    console.error("\n❌ Execution Blocked: Diagnostics Failed.");
    console.error(`Message: ${error.message}`);
    if (error.failures) {
      console.error("API Failure Details:", JSON.stringify(error.failures, null, 2));
    }
  }
}

// Securely invoke the main workflow engine
if (require.main === module) {
  runDiagnosticAndBypass();
}

module.exports = { runDiagnosticAndBypass };