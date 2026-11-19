/* ===== DRIFT LABS SETTINGS: change these lines ===== */

// Stripe Payment Links, one per package (Stripe > Payment Links)
export const STRIPE_LINKS = {
  base:   "https://buy.stripe.com/REPLACE_ME_BASE",    // $100 Base Tune
  daily:  "https://buy.stripe.com/REPLACE_ME_DAILY",   // $200 Daily Tune
  custom: "https://buy.stripe.com/REPLACE_ME_CUSTOM"   // $350 Custom Tune
};

// Optional: a Formspree form ID (formspree.io). When set, you get an email
// for every new order and every new customer message.
export const FORMSPREE_ID = "";

// Public contact email shown to customers
export const CONTACT_EMAIL = "yourname@example.com";

/* =================================================== */

export const PACKAGES = {
  base:   { name: "Base Tune",   price: 100, revisions: 1 },
  daily:  { name: "Daily Tune",  price: 200, revisions: 2 },
  custom: { name: "Custom Tune", price: 350, revisions: 4 }
};

export const STATUSES = {
  awaiting_payment: { label: "Waiting for payment", tone: "warn" },
  waiting_files:    { label: "Paid · send your files", tone: "info" },
  tuning:           { label: "Tune in progress", tone: "info" },
  revisions:        { label: "Revisions", tone: "info" },
  complete:         { label: "Complete", tone: "good" }
};
