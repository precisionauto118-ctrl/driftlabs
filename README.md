# Drift Labs Website

Website for **Drift Labs**, a remote ECU tuning business that serves the whole US. Two platforms:

- **Megasquirt** (MS2, MS3, MS3Pro, MSPNP) with **TunerStudio**, for any vehicle running Megasquirt. NA and NB Miatas are the specialty.
- **HP Tuners** (VCM Suite) for **GM cars and trucks**: Corvette, Camaro, Silverado, Sierra, Tahoe and more.

Customers create an account (any email, or Google), order and pay in their own portal, message the tuner, and track revisions. The tuner manages everything from an admin dashboard.

Live site: https://precisionauto118-ctrl.github.io/driftlabs/
Customer portal: https://precisionauto118-ctrl.github.io/driftlabs/portal.html
Admin dashboard: https://precisionauto118-ctrl.github.io/driftlabs/admin.html

## Files

| File | What it is |
|---|---|
| `index.html` | Homepage. Order buttons send customers to the portal. |
| `portal.html` / `portal.js` | Customer portal: sign in or sign up, order a tune, pay, message the tuner, track status and revisions. |
| `admin.html` / `admin.js` | Admin dashboard: every order, filters, replies, status, "Paid" checkbox, revision counter. Only the admin account can open it. |
| `common.js` | Shared Firebase setup and helpers. |
| `settings.js` | **Your settings:** Stripe links, Formspree ID, contact email, packages, statuses. |
| `firebase-config.js` | Firebase web config (public values, not secrets). |
| `portal.css` | Styles for the portal and admin pages. |
| `README.md` | This file. |

To change the site: edit the file on GitHub (click it, then the pencil icon), then commit. The live site updates in about a minute.

## Backend: Firebase project `driftlabstuning`

- **Sign-in:** Email/Password (any email, with email verification) and Google. Authorized domain: `precisionauto118-ctrl.github.io`. Add the custom domain there later.
- **Database:** Cloud Firestore, `nam5 (United States)`, production mode.
  - `users/{uid}`: name, email
  - `orders/{orderId}`: customer, package, price, vehicle details, `status`, `paid`, `revisionsAllowed`, `revisionsUsed`, unread flags
  - `orders/{orderId}/messages/{id}`: `from` (customer/admin), text, time
- **Security rules:** published in Firebase console > Firestore > Rules. They are **not** in this repo because they name the admin email. Customers can only see their own orders and messages. Only the admin account can see everything and change status, paid and revisions. The rules also check order prices.
- **Admin:** open `admin.html` and sign in with Google using the admin account.
- **Payments:** the portal's Pay button opens the package's Stripe link with `client_reference_id` set to the order ID. When Stripe emails you about a payment, open the order in the dashboard and check **Paid**.
- **Files:** customers email them to `CONTACT_EMAIL` with their order number in the subject (shown in the portal once `CONTACT_EMAIL` is set), or paste a Google Drive / Dropbox link in a message (links are clickable). Built-in uploads were skipped on purpose to stay on the free Spark plan; they need Blaze (card on file, $30 refundable prepayment at signup). Revisit once there are steady customers.

## Business decisions so far

- **Name:** Drift Labs. No car tuning company uses it. A crypto company and a small NZ software studio use "Drift Labs", so different industries. "RaceLabs" was rejected because a dyno tuning shop in Indiana uses "RaceLab".
- **Experience:** 10+ years in the tuning business, including Corvettes and Silverados on HP Tuners. The site does not name a shop or location on purpose, so it reads as a nationwide business.
- **Market:** US-wide, all 50 states.
- **Turnaround:** tunes and revisions usually go out within a few hours ("Same-day tunes").
- **Pricing** (same for Megasquirt and HP Tuners):
  - **Base Tune, $100:** base tune to get started and running right, 1 revision round, email support
  - **Daily Tune, $200:** smooth, reliable daily driving (idle, cold start, part throttle), 2 revision rounds, email support
  - **Custom Tune, $350 (most popular):** custom remote tune built to the customer's request, up to 4 revision rounds, email support through the whole process
  - The revision counts for Base (1) and Daily (2) were a first guess. Adjust them if needed.
- **Add-ons:** extra revision round $50, re-tune after new mods $150, boost/launch control setup $75.
- **Refunds:** none. All purchases are final (FAQ, footer and order checkbox).
- **Payments:** a Stripe Payment Link for each package. The customer pays on Stripe's checkout page.
- **Order emails:** an optional Formspree ID sends you an email for each new order and customer message.
- **Hosting:** free on GitHub Pages now, custom domain later.
- **Legal:** tunes are sold for off-road and competition use only. **No emissions deletes** (cat, EGR, DPF). **AFM/DFM (DOD) disable and delete-kit tunes are offered for GM vehicles in general (cars, trucks, SUVs), racing use only.** This is stated in the FAQ, footer and order form checkbox. The footer says Drift Labs isn't affiliated with Mazda, GM, HP Tuners or Megasquirt. Don't use brand names in the business name.

## Settings to fill in

In `settings.js`:

```js
export const STRIPE_LINKS = {
  base:   "https://buy.stripe.com/REPLACE_ME_BASE",    // $100 Base Tune
  daily:  "https://buy.stripe.com/REPLACE_ME_DAILY",   // $200 Daily Tune
  custom: "https://buy.stripe.com/REPLACE_ME_CUSTOM"   // $350 Custom Tune
};
export const FORMSPREE_ID = "";                         // optional, for email alerts
export const CONTACT_EMAIL = "leviarnold.118@gmail.com";
```

## Still to do

- [x] Stripe account created and 3 **sandbox (test)** Payment Links made and added (redirect back to portal.html after paying)
- [ ] Finish Stripe business verification ("Verify your business"), then copy the 3 links to live mode and replace the test links in `settings.js`
- [x] Set `CONTACT_EMAIL` (customers email files here)
- [ ] Later, when busy: upgrade Firebase to Blaze for built-in file uploads (optional)
- [ ] Add a privacy policy page (needed now that customers create accounts)
- [ ] Later: automatic "Paid" status from Stripe (needs Blaze and a small server function)
- [ ] (Optional) Create a Formspree form and paste its ID into `FORMSPREE_ID`
- [ ] Fill in the yellow highlighted placeholders (search the file for `class="fill"`):
  - [ ] 3 real customer reviews, used with permission (never made up)
- [ ] Once nothing is left to fill in, delete the `.fill` style rule so no yellow highlights remain
- [ ] Grab social handles (Facebook, Instagram) for Drift Labs
- [ ] Check a domain (e.g. driftlabstuning.com) and run the USPTO trademark search: https://tmsearch.uspto.gov
- [ ] Maybe: a simple Drift Labs text logo
- [ ] Later: buy the domain and point it at GitHub Pages (Settings → Pages → Custom domain)

## Getting the word out (nationwide)

- Miata: Miata.net, MiataTurbo.net, r/Miata, NA/NB Facebook groups
- Megasquirt: msextra.com forums, r/Megasquirt
- GM: LS1Tech, CorvetteForum, GM-Trucks.com, r/Corvette, r/Silverado
- Post dyno sheets and before/after logs as proof of results
- (Optional) Google Business Profile set up as an online service business without a public address
