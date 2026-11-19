# Drift Labs Website

Website for **Drift Labs**, a remote ECU tuning business that serves the whole US. Two platforms:

- **Megasquirt** (MS2, MS3, MS3Pro, MSPNP) with **TunerStudio**, for any vehicle running Megasquirt. NA and NB Miatas are the specialty.
- **HP Tuners** (VCM Suite) for **GM cars and trucks**: Corvette, Camaro, Silverado, Sierra, Tahoe and more.

Customers order online, pay through Stripe, send their files and datalogs by email, and get a custom tune back.

Live site: https://precisionauto118-ctrl.github.io/driftlabs/

## Files

| File | What it is |
|---|---|
| `index.html` | **The website.** GitHub Pages serves this file. |
| `README.md` | This file. |

To change the site: edit `index.html` (on GitHub, click the file, then the pencil icon), then commit. The live site updates in about a minute.

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
- **Order emails:** Formspree (optional, free) sends each order form to the business email.
- **Hosting:** free on GitHub Pages now, custom domain later.
- **Legal:** tunes are sold for off-road and competition use only. **No emissions deletes** (cat, EGR, DPF). **AFM/DFM (DOD) disable and delete-kit tunes are offered for GM vehicles in general (cars, trucks, SUVs), racing use only.** This is stated in the FAQ, footer and order form checkbox. The footer says Drift Labs isn't affiliated with Mazda, GM, HP Tuners or Megasquirt. Don't use brand names in the business name.

## Settings to fill in

At the top of the `<script>` near the bottom of `index.html`:

```js
var STRIPE_BASE_LINK   = "https://buy.stripe.com/REPLACE_ME_BASE";    // $100 Base Tune
var STRIPE_DAILY_LINK  = "https://buy.stripe.com/REPLACE_ME_DAILY";   // $200 Daily Tune
var STRIPE_CUSTOM_LINK = "https://buy.stripe.com/REPLACE_ME_CUSTOM";  // $350 Custom Tune
var FORMSPREE_ID = "";                                                 // e.g. "xyzabcd" from formspree.io
var CONTACT_EMAIL = "yourname@example.com";                            // business email
```

## Still to do

- [ ] Create a Stripe account and make 3 Payment Links ($100, $200, $350). Paste them into the settings above.
- [ ] Set `CONTACT_EMAIL` to the business email
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
