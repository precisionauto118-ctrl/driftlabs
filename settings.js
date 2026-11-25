/* ===== DRIFT LABS SETTINGS: change these lines ===== */

// Stripe Payment Links, one per package (Stripe > Payment Links)
// These are LIVE links: real money moves.
export const STRIPE_LINKS = {
  base:   "https://buy.stripe.com/28EcMX7h92tjgd77Iv1wY00",   // $100 Base Tune
  daily:  "https://buy.stripe.com/aFa6ozatl2tjgd7d2P1wY01",   // $200 Daily Tune
  custom: "https://buy.stripe.com/cNi9ALgRJaZPd0V8Mz1wY02"    // $350 Custom Tune
};

// Optional: a Formspree form ID (formspree.io). When set, you get an email
// for every new order and every new customer message.
export const FORMSPREE_ID = "";

// Public contact email shown to customers
export const CONTACT_EMAIL = "leviarnold.118@gmail.com";

// Built-in file uploads. Turn on only after Firebase is on the Blaze plan,
// Storage is created, and storage.rules is published.
export const UPLOADS_ENABLED = false;

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
