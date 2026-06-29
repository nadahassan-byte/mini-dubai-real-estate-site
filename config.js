/* PRIME site configuration.
 *
 * Everything here is safe to commit and ship to the browser.
 *
 * ── Where enquiries go ───────────────────────────────────────────────
 * Out of the box, enquiries are stored in the visitor's browser
 * (localStorage) so the forms are fully functional with zero setup, and
 * you can export them from any page console with:  PRIME.exportEnquiries()
 *
 * To capture enquiries for real, fill in ONE of the options below.
 *
 *  A) Email via Web3Forms (easiest — free, no backend):
 *     1. Get a free access key at https://web3forms.com (enter your email).
 *     2. Paste it as web3formsKey below. Enquiries arrive in your inbox.
 *
 *  B) Store rows in Supabase (a real database):
 *     1. Create a table `enquiries` with text columns:
 *          name, email, phone, interest, message, property_ref, source
 *     2. Add an RLS policy allowing anonymous INSERT on that table.
 *     3. Paste your project URL and anon (publishable) key below.
 *
 * Filling either one automatically switches the forms over to it; if both
 * are set, Supabase is used. localStorage always keeps a local copy too.
 */
window.PRIME_CONFIG = {
  // A) Web3Forms — paste your access key to receive enquiries by email.
  web3formsKey: "",

  // B) Supabase — paste your project URL + anon key to store enquiries.
  supabaseUrl: "",
  supabaseAnonKey: "",
  enquiriesTable: "enquiries",

  // Live FX endpoint (no API key). Falls back to bundled static rates.
  fxEndpoints: [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/aed.json",
    "https://latest.currency-api.pages.dev/v1/currencies/aed.json",
  ],
};
